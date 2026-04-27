import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as xlsx from 'xlsx';
import Papa from 'papaparse';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { spawn } from "child_process";
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

// Load Firebase Config safely
let firebaseConfig: any = {};
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(configPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Initialize Firebase Admin
if (getApps().length === 0 && firebaseConfig.projectId) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const app = express();
const PORT = 3000;

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

/** Extracts and verifies Firebase ID token, attaches decoded user to req */
const verifyAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (getApps().length === 0) {
    return res.status(503).json({ error: "Authentication service unavailable" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    (req as any).user = decodedToken;
    (req as any).userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Firebase auth error:", error);
    res.status(401).json({ error: "Invalid identity token" });
  }
};

/** Verifies admin status (uses custom claims or email fallback) */
const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (getApps().length === 0) {
    return res.status(503).json({ error: "Authentication service unavailable" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check custom claims first, fall back to email check
    const isAdmin = decodedToken.admin === true || decodedToken.email === 'muhammadnaveedalijatt786@gmail.com';

    if (!isAdmin) {
      return res.status(403).json({ error: "Unauthorized. Admin privileges required." });
    }
    
    (req as any).user = decodedToken;
    (req as any).userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Firebase admin auth error:", error);
    res.status(401).json({ error: "Invalid identity token" });
  }
};

// File upload with size limit (50MB max)
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }
});

// In-memory state (Simulating a database)
interface Dataset {
  id: string;
  name: string;
  rows: number;
  columns: number;
  schema: any[];
  preview: any[];
  createdAt: string;
  userId?: string;
}

interface AnalysisRecord {
  id: string;
  query: string;
  datasetId: string;
  datasetName: string;
  result: any;
  timestamp: string;
  userId?: string;
}

const db = {
  datasets: [] as Dataset[],
  history: [] as AnalysisRecord[],
  settings: {
    theme: 'dark',
    model: 'gemini-3-flash-preview',
    autoLoad: true
  }
};

async function startServer() {
  app.use(express.json({ limit: '10mb' }));
  
  // ============================================================
  // RATE LIMITING
  // ============================================================
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
  });
  app.use('/api/', apiLimiter);

  // Serve uploads directory with Content-Disposition to prevent XSS
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Content-Disposition', 'attachment');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // ============================================================
  // GEMINI AI PROXY (keeps API key server-side only)
  // ============================================================
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  const GEMINI_MODEL = 'gemini-3-flash-preview';

  const SYSTEM_INSTRUCTION = `You are an expert data analyst assistant. Your job is to help users understand their data through analysis, visualizations, and machine learning — clearly and efficiently.

## Data & Input
- Accept and analyze data from CSV, Excel, PDF, JSON, plain text, and SQL results.
- When data is provided, immediately profile it: shape, column types, missing values, and a brief sample.
- Flag data quality issues (nulls, duplicates, outliers, type mismatches) before proceeding.
- Never invent, guess, or fabricate data values. Work only with what the user provides.

## Analysis
- Perform exploratory data analysis (EDA), descriptive statistics, correlation analysis, trend detection, hypothesis testing, segmentation, and time-series analysis as needed.
- Choose the most appropriate method for the user's question. Briefly explain your choice.
- Lead every response with the key insight — not the methodology.

## Visualizations
- Produce charts and tables when they add value beyond what text alone can convey.
- Automatically select the best chart type for the data (trends → line chart, distributions → histogram, comparisons → bar chart, relationships → scatter plot).
- Always include axis labels, titles, and legends. Annotate key findings directly on charts.
- Do not produce a chart for simple, single-value answers.

## Machine Learning & Modeling
- Build and explain regression, classification, clustering, forecasting, and anomaly detection models as requested.
- Always: explain why you chose the model, establish a baseline, use cross-validation, and report appropriate evaluation metrics (RMSE, F1, AUC, etc.).
- Show feature importances or SHAP values to explain model behavior.
- Warn the user about overfitting, data leakage, or class imbalance if detected.

## Code
- Do NOT show code unless the user explicitly asks for it.
- When code is requested, provide complete, fully runnable Python code with all imports included.

## Response Style
- Be concise. No filler, no restating the question.
- Always lead with the answer or key finding.
- End complex analyses with 2–3 suggested next steps.
- Never make up data or results. If the data is insufficient, say so clearly.`;

  /** Server-side Gemini chat endpoint (non-streaming) */
  app.post("/api/chat", verifyAuth, async (req, res) => {
    try {
      const { messages, agent } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array required" });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const formattedContents = messages
        .filter((m: any) => m.role !== 'system')
        .map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

      let systemPrompt = SYSTEM_INSTRUCTION;
      if (agent) {
        systemPrompt = `You are now acting as the "${agent}" agent. ${SYSTEM_INSTRUCTION}`;
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: formattedContents,
        config: { systemInstruction: systemPrompt }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "AI generation failed", details: error.message });
    }
  });

  /** Server-side Gemini streaming endpoint */
  app.post("/api/chat/stream", verifyAuth, async (req, res) => {
    try {
      const { messages, agent } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array required" });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const formattedContents = messages
        .filter((m: any) => m.role !== 'system')
        .map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

      let systemPrompt = SYSTEM_INSTRUCTION;
      if (agent) {
        systemPrompt = `You are now acting as the "${agent}" agent. ${SYSTEM_INSTRUCTION}`;
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: GEMINI_MODEL,
        contents: formattedContents,
        config: { systemInstruction: systemPrompt }
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Gemini Streaming Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "AI streaming failed", details: error.message });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  });

  // ============================================================
  // PROFILE IMAGE UPLOAD (with real token verification)
  // ============================================================
  app.post("/api/user/profile-image", verifyAuth, upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Validate it's actually an image
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (req.file.mimetype && !allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Invalid file type. Only images allowed." });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });

  // ============================================================
  // PYTHON BACKEND (Windows-compatible)
  // ============================================================
  const startPythonBackend = () => {
    // On Windows, use 'python' first; on Unix, use 'python3' first
    const primaryCmd = process.platform === 'win32' ? 'python' : 'python3';
    const fallbackCmd = process.platform === 'win32' ? 'python3' : 'python';

    const tryStartPython = (cmd: string, isFallback = false) => {
      console.log(`Checking and installing Python dependencies using ${cmd}...`);
      const install = spawn(cmd, ["-m", "pip", "install", "fastapi", "uvicorn", "pandas", "python-multipart"]);

      install.on("error", (err: any) => {
        if (err.code === 'ENOENT' && !isFallback) {
          console.warn(`${cmd} not found, trying '${fallbackCmd}'...`);
          tryStartPython(fallbackCmd, true);
        } else {
          console.error(`Failed to start ${cmd} for pip install:`, err.message);
        }
      });

      install.stdout.on("data", (data) => console.log(`[pip] ${data}`));
      install.stderr.on("data", (data) => console.error(`[pip-error] ${data}`));

      install.on("close", (code) => {
        if (code === 0) {
          console.log(`Python dependencies verified/installed. Starting main.py using ${cmd}...`);
          const pythonProcess = spawn(cmd, ["main.py"]);

          pythonProcess.on("error", (err) => {
            console.error(`Failed to start Python process (${cmd}):`, err.message);
          });

          pythonProcess.stdout.on("data", (data) => console.log(`[Python] ${data}`));
          pythonProcess.stderr.on("data", (data) => console.error(`[Python stderr] ${data}`));
          pythonProcess.on("close", (code) => console.log(`Python process exited with code ${code}`));
        } else if (code !== null) {
          console.error(`Pip installation process exited with code ${code}`);
        }
      });
    };

    try {
      tryStartPython(primaryCmd);
    } catch (e) {
      console.error("Critical error starting Python backend:", e);
    }
  };

  startPythonBackend();

  // Proxy to Python FastAPI backend
  app.use('/api/python', createProxyMiddleware({
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error('Proxy to Python failed:', err.message);
        if (res instanceof express.response.constructor) {
          (res as express.Response).status(502).json({ error: 'Python analysis engine is offline' });
        }
      }
    }
  }));

  // ============================================================
  // PUBLIC ENDPOINTS
  // ============================================================
  app.get("/api/health", (req, res) => res.json({ status: "ok", node: true }));

  // ============================================================
  // AUTHENTICATED ENDPOINTS
  // ============================================================

  // Dashboard Summary
  app.get("/api/dashboard/summary", verifyAuth, (req, res) => {
    const userId = (req as any).userId;
    res.json({
      totalDatasets: db.datasets.filter(d => !d.userId || d.userId === userId).length,
      totalAnalyses: db.history.filter(h => !h.userId || h.userId === userId).length,
      recentAnalyses: db.history.filter(h => !h.userId || h.userId === userId).slice(-5).reverse(),
      storageUsed: "4.2 MB",
      healthScore: "98%"
    });
  });

  // Datasets - GET
  app.get("/api/datasets", verifyAuth, (req, res) => {
    const userId = (req as any).userId;
    const userDatasets = db.datasets.filter(d => !d.userId || d.userId === userId);
    res.json(userDatasets);
  });

  // Datasets - DELETE (with ownership check)
  app.delete("/api/datasets/:id", verifyAuth, (req, res) => {
    const userId = (req as any).userId;
    const dataset = db.datasets.find(d => d.id === req.params.id);
    
    if (!dataset) {
      return res.status(404).json({ error: "Dataset not found" });
    }
    if (dataset.userId && dataset.userId !== userId) {
      return res.status(403).json({ error: "You can only delete your own datasets" });
    }

    db.datasets = db.datasets.filter(d => d.id !== req.params.id);
    res.json({ success: true });
  });

  // History - GET
  app.get("/api/history", verifyAuth, (req, res) => {
    const userId = (req as any).userId;
    const userHistory = db.history.filter(h => !h.userId || h.userId === userId);
    res.json(userHistory);
  });

  // History - POST
  app.post("/api/history", verifyAuth, (req, res) => {
    const userId = (req as any).userId;
    const record: AnalysisRecord = {
      id: Date.now().toString(),
      ...req.body,
      userId,
      timestamp: new Date().toISOString()
    };
    db.history.push(record);
    res.json(record);
  });

  // History - DELETE (with ownership check)
  app.delete("/api/history/:id", verifyAuth, (req, res) => {
    const userId = (req as any).userId;
    const index = db.history.findIndex(h => h.id === req.params.id && (!h.userId || h.userId === userId));
    if (index !== -1) {
      db.history.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "History item not found or unauthorized" });
    }
  });

  // File Upload (authenticated)
  app.post("/api/upload", verifyAuth, upload.single('file'), async (req, res) => {
    const userId = (req as any).userId;

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let data: any[] = [];

    try {
      if (fileExt === '.csv') {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsed = Papa.parse(fileContent, { header: true, dynamicTyping: true });
        data = parsed.data;
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Unsupported file type. Use .csv, .xlsx, or .xls" });
      }

      fs.unlinkSync(filePath);

      const columns = Object.keys(data[0] || {});
      const schema = columns.map(col => {
        const sampleValues = data.map(r => r[col]).filter(v => v !== null && v !== undefined);
        return { name: col, type: typeof sampleValues[0], nullCount: data.length - sampleValues.length };
      });

      const newDataset: Dataset = {
        id: Date.now().toString(),
        name: req.file.originalname,
        rows: data.length,
        columns: columns.length,
        schema,
        preview: data.slice(0, 50),
        createdAt: new Date().toISOString(),
        userId
      };

      db.datasets.push(newDataset);
      res.json(newDataset);

    } catch (err) {
      console.error(err);
      // Clean up file if it still exists
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: "Failed to process file" });
    }
  });

  // Settings (authenticated)
  app.get("/api/settings", verifyAuth, (req, res) => res.json(db.settings));
  app.post("/api/settings", verifyAuth, (req, res) => {
    // Only allow known keys
    const allowedKeys = ['theme', 'model', 'autoLoad'];
    const filtered: any = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        filtered[key] = req.body[key];
      }
    }
    db.settings = { ...db.settings, ...filtered };
    res.json(db.settings);
  });

  // ============================================================
  // ADMIN ROUTES
  // ============================================================
  app.get("/api/admin/stats", verifyAdmin, (req, res) => {
    res.json({
      activeUsers: 1,
      totalDatasets: db.datasets.length,
      storageUsed: "124 MB",
      queriesToday: 42
    });
  });

  app.get("/api/admin/logs", verifyAdmin, (req, res) => {
    res.json([
      { id: '1', event: 'System Start', user: 'System', timestamp: new Date().toISOString() },
      { id: '2', event: 'Internal Guard Active', user: 'Security', timestamp: new Date().toISOString() },
      { id: '3', event: 'Firebase Sync', user: 'System', timestamp: new Date().toISOString() },
    ]);
  });

  // ============================================================
  // VITE DEV SERVER
  // ============================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
