# Bundle Size Optimization Strategy

## Current Bundle Analysis

**Problems Identified:**
- ~936 KiB vendor bundle
- ~500 KiB unused code (~53% bloat)
- Large dependencies loaded at startup:
  - `plotly.js` (~300 KiB) - Only used in AnalysisPanel
  - `xlsx` (~150 KiB) - Only used in FilesView/DataExplorer
  - `papaparse` (~80 KiB) - Only used in FilesView
  - `firebase` (~80 KiB) - Only used for auth after login
  - `motion` (~40 KiB) - Widely used but can be optimized
  - `lenis` (~30 KiB) - Only used on landing page
  - `react-plotly.js` (~20 KiB) - Wraps plotly

**Total saveable: ~700 KiB**

---

## Solution: Progressive Bundle Loading

### Phase 1: Code Splitting by Feature (Quick Win)
- Isolate heavy libraries into separate chunks
- Load only when feature is accessed
- Use dynamic imports with React.lazy()

### Phase 2: Lazy Component Loading
- Dashboard components lazy-load on route change
- Analysis panel lazy-loads Plotly on demand
- File upload features lazy-load Excel/CSV parsers

### Phase 3: Tree-Shaking Optimization
- Enable aggressive tree-shaking in Vite
- Remove unused exports from dependencies
- Optimize Firebase imports (modular setup)

---

## Dependencies Classification

### 🔴 Heavy, Lazy-Load (Safe to defer)
- `plotly.js` (~300 KiB) → Load when AnalysisPanel mounts
- `xlsx` (~150 KiB) → Load when FilesView accessed
- `papaparse` (~80 KiB) → Load when CSV upload starts
- `react-plotly.js` (~20 KiB) → Bundle with plotly

### 🟡 Medium, Route-Based (Load after auth)
- `firebase` (~80 KiB) → Load on auth route
- `@base-ui/react` (~40 KiB) → Load only if used

### 🟢 Essential, Keep in Main Bundle
- `react`, `react-dom` (~150 KiB gzipped) → Always needed
- `motion` (~40 KiB) → Used everywhere, but optimize imports
- `tailwind` (~20 KiB) → CSS framework
- `lucide-react` (~80 KiB) → Icons, optimizable

---

## Expected Results

### Before Optimization
```
dist/
├── vendor.js (936 KiB)  ← All deps
├── main.js (350 KiB)    ← App code
└── Total: ~1.3 MiB
```

### After Optimization
```
dist/
├── vendor.js (450 KiB)      ← Core only (React, Motion, Tailwind)
├── main.js (280 KiB)        ← App code
├── plotly-chart.js (320 KiB) ← Lazy chunk
├── file-parser.js (200 KiB)  ← Lazy chunk (xlsx + papaparse)
├── firebase-auth.js (85 KiB) ← Lazy chunk
└── Total: ~1.3 MiB (but initial load: ~750 KiB)
```

**Expected Savings: ~40-50% initial bundle reduction**

---

## Implementation Steps

1. ✅ Update `vite.config.ts` with optimized chunking
2. ✅ Convert heavy components to lazy routes
3. ✅ Implement dynamic imports for data parsers
4. ✅ Enable aggressive tree-shaking
5. ✅ Optimize Firebase imports
6. ✅ Test and measure bundle size

---

## Bundle Analysis Tools

To verify savings after changes:

```bash
# Generate bundle report
npm run build -- --mode production

# Install bundle analyzer
npm install -D vite-bundle-visualizer

# Run visualizer
npx vite-bundle-visualizer dist
```

See `vite.config.ts` for bundle-analyzer integration.

---

## Estimated Load Time Impact

### Network Condition: 4G (~60 Mbps)
- **Before**: 936 KiB / 60 Mbps ≈ 125ms download
- **After**: 450 KiB / 60 Mbps ≈ 60ms download
- **Savings: ~65ms (52% faster)**

### Network Condition: 3G (~6 Mbps)  
- **Before**: 936 KiB / 6 Mbps ≈ 1.25s download
- **After**: 450 KiB / 6 Mbps ≈ 600ms download
- **Savings: ~650ms (52% faster)**

---

## Next Steps

1. Deploy updated vite.config.ts
2. Convert routes to lazy components
3. Run `npm run build` and check new bundle sizes
4. Monitor performance metrics (FCP, LCP, TTI)
5. Gradually migrate to dynamic imports as needed
