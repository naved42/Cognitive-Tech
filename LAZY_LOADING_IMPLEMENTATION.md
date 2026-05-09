# Lazy Loading Implementation Guide

## Quick Reference: Converting Components to Lazy Load

### 1. AnalysisPanel: Lazy Load Plotly

**Before:**
```tsx
import Plot from 'react-plotly.js';

export default function AnalysisPanel() {
  return (
    <Plot
      data={chartData}
      layout={layout}
      config={{ responsive: true }}
    />
  );
}
```

**After (Lazy Loaded):**
```tsx
import { lazy, Suspense } from 'react';
import { lazyPlotly } from '@/lib/lazy-imports';

const PlotChart = lazy(() => 
  lazyPlotly().then(m => ({ default: m.default }))
);

function PlotchartFallback() {
  return (
    <div className="flex items-center justify-center h-96 bg-slate-100 dark:bg-slate-900 rounded">
      <p className="text-slate-500">Loading chart...</p>
    </div>
  );
}

export default function AnalysisPanel() {
  return (
    <Suspense fallback={<PlotchartFallback />}>
      <PlotChart
        data={chartData}
        layout={layout}
        config={{ responsive: true }}
      />
    </Suspense>
  );
}
```

---

### 2. FilesView: Lazy Load Excel & CSV Parsers

**Before:**
```tsx
import XLSX from 'xlsx';
import Papa from 'papaparse';

export default function FilesView() {
  const handleUpload = async (file: File) => {
    if (file.name.endsWith('.csv')) {
      const csv = Papa.parse(await file.text(), { header: true });
      // ...
    } else if (file.name.endsWith('.xlsx')) {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      // ...
    }
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
}
```

**After (Lazy Loaded):**
```tsx
import { parseCSV, parseExcel } from '@/lib/lazy-imports';

export default function FilesView() {
  const handleUpload = async (file: File) => {
    try {
      if (file.name.endsWith('.csv')) {
        const data = await parseCSV(file);
        // ...
      } else if (file.name.endsWith('.xlsx')) {
        const data = await parseExcel(file);
        // ...
      }
    } catch (error) {
      console.error('Parse error:', error);
    }
  };

  return (
    <input 
      type="file" 
      onChange={(e) => handleUpload(e.target.files?.[0])} 
      accept=".csv,.xlsx,.xls"
    />
  );
}
```

---

### 3. LandingPage: Lazy Load Lenis Scroll

**Before:**
```tsx
import { ReactLenis } from 'lenis/react';

export default function LandingPage() {
  return (
    <ReactLenis root>
      <div className="scroll-content">
        {/* Landing page content */}
      </div>
    </ReactLenis>
  );
}
```

**After (Lazy Loaded):**
```tsx
import { lazy, Suspense } from 'react';
import { lazyLenis } from '@/lib/lazy-imports';

// Dynamically import and extract ReactLenis
const LenisWrapper = lazy(() =>
  lazyLenis().then(m => ({ 
    default: ({ children }) => (
      <m.ReactLenis root>
        {children}
      </m.ReactLenis>
    )
  }))
);

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LenisWrapper>
        <div className="scroll-content">
          {/* Landing page content */}
        </div>
      </LenisWrapper>
    </Suspense>
  );
}
```

---

### 4. Firebase Auth: Lazy Load on Auth Route

**In App.tsx or Router:**
```tsx
import { lazy, Suspense } from 'react';

// Lazy load firebase only when auth is accessed
const AuthModal = lazy(() => 
  import('./components/auth/AuthModal')
);

export default function App() {
  return (
    <Suspense fallback={<div>Loading auth...</div>}>
      <AuthModal />
    </Suspense>
  );
}
```

**In AuthModal.tsx:**
```tsx
import { useAuth } from '@/hooks/useAuth';

export default function AuthModal() {
  const { auth, googleProvider, signInWithGoogle } = useAuth();
  
  // Firebase auth is now only loaded when this component mounts
  return (
    <div>
      {/* Auth UI */}
    </div>
  );
}
```

---

### 5. Google Generative AI: Lazy Load on Demand

**In ChatComponents.tsx:**
```tsx
import { lazyGoogleGenAI } from '@/lib/lazy-imports';
import { useState } from 'react';

export default function ChatComponents() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateResponse = async (prompt: string) => {
    setIsGenerating(true);
    try {
      // GenAI loaded only when needed
      const genAI = await lazyGoogleGenAI(
        import.meta.env.VITE_GOOGLE_API_KEY
      );
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash' 
      });
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button onClick={() => generateResponse('Hello')}>
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
}
```

---

## Priority Implementation Order

### Immediate (Highest Impact - 300-400 KiB savings)
1. **AnalysisPanel + Plot** - Convert to lazy component
   - Impact: ~320 KiB (plotly.js + react-plotly)
   - Time: 15 minutes

2. **FilesView + Parsers** - Use lazy parse functions
   - Impact: ~230 KiB (xlsx + papaparse)
   - Time: 20 minutes

### High Priority (100-150 KiB savings)
3. **LandingPage + Lenis** - Lazy load scroll library
   - Impact: ~30 KiB
   - Time: 10 minutes

4. **AuthModal + Firebase** - Route-based lazy loading
   - Impact: ~80 KiB
   - Time: 15 minutes

### Medium Priority (Optional)
5. **ChatComponents + GenAI** - Lazy load on first use
   - Impact: ~40 KiB (depends on library size)
   - Time: 10 minutes

---

## Testing Lazy Loading

### 1. Verify chunks are created:
```bash
npm run build
ls -la dist/js/
```

You should see separate files:
```
plotly-chart-xxxxx.js (320 KiB)
file-parser-xlsx-xxxxx.js (150 KiB)
file-parser-csv-xxxxx.js (80 KiB)
firebase-auth-xxxxx.js (80 KiB)
scroll-lib-xxxxx.js (30 KiB)
main-xxxxx.js (280 KiB)  ← Much smaller!
```

### 2. Test in browser DevTools:

**Network Tab:**
- Load page → main.js + core vendor chunks load
- Open AnalysisPanel → plotly-chart.js loads on demand
- Upload file → file-parser-*.js loads on demand

**Performance Tab (Lighthouse):**
- FCP should improve (smaller initial JS)
- LCP might improve (faster paint)
- TTI should improve (less parsing/compilation)

### 3. Measure bundle impact:

```bash
npm install -D vite-bundle-visualizer

# After build
npx vite-bundle-visualizer dist/
```

---

## Error Handling for Lazy Chunks

Add error boundary for graceful failures:

```tsx
import { lazy, Suspense, Component, ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Chunk loading failed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          Failed to load feature. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap lazy components:
<ErrorBoundary>
  <Suspense fallback={<LoadingSpinner />}>
    <AnalysisPanel />
  </Suspense>
</ErrorBoundary>
```

---

## Expected Results After Implementation

### Before:
```
Initial JS: ~936 KiB
First Load: 1.2 MiB
FCP: 2.5s (4G)
LCP: 3.2s
TTI: 4.5s
```

### After:
```
Initial JS: ~450 KiB (52% reduction)
First Load: ~750 KiB (38% reduction)
FCP: 1.6s (36% improvement)
LCP: 2.1s
TTI: 2.8s (38% improvement)
```

---

## Tree-Shaking Verification

Check that unused code is actually removed:

```bash
# Build and inspect vendor chunk
npm run build
strings dist/js/vendor-other-*.js | grep "console.log" | wc -l
# Should be 0 in production (all console.log removed)
```

---

## Monitoring in Production

Add Web Vitals tracking:

```tsx
// In App.tsx
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

if (import.meta.env.PROD) {
  getCLS(console.log);
  getFCP(console.log);
  getFID(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

This will show you Core Web Vitals improvements after deployment!
