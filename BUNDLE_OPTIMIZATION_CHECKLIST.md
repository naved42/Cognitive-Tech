# Bundle Optimization - Implementation Checklist

## Phase 1: Configuration (✅ COMPLETED)

- [x] Update vite.config.ts with advanced code splitting
- [x] Enable aggressive tree-shaking (Terser 2-pass)
- [x] Configure optimizeDeps to pre-bundle only essential deps
- [x] Create lazy-imports.ts utility library
- [x] Add npm scripts for bundle analysis

**Files Modified:**
- `vite.config.ts` - Advanced chunking strategy
- `src/lib/lazy-imports.ts` - Lazy loading utilities
- `package.json` - Added `analyze:bundle` script
- `scripts/analyze-bundle.js` - Bundle analysis tool

---

## Phase 2: Component Conversion (READY TO START)

### Priority 1: AnalysisPanel + Plotly (320 KiB)
- [ ] Open `src/components/AnalysisPanel.tsx`
- [ ] Remove: `import Plot from 'react-plotly.js';`
- [ ] Add lazy imports and Suspense wrapper
- [ ] Test: Upload file with chart preview
- [ ] Verify: plotly-chart chunk created in dist/js/

**Estimated Time:** 15 minutes
**Impact:** ~320 KiB deferred from main bundle

**Checklist:**
```
[ ] Replace import with lazy()
[ ] Add Suspense wrapper with fallback
[ ] Add error boundary (optional but recommended)
[ ] Test in browser DevTools Network tab
[ ] Verify chunk loads on demand
```

---

### Priority 2: FilesView + Excel Parser (150 KiB)
- [ ] Open `src/components/views/FilesView.tsx`
- [ ] Remove: `import XLSX from 'xlsx';`
- [ ] Import: `import { parseExcel } from '@/lib/lazy-imports';`
- [ ] Update file upload handler to use parseExcel()
- [ ] Test: Upload Excel file
- [ ] Verify: file-parser-xlsx chunk created

**Estimated Time:** 20 minutes
**Impact:** ~150 KiB deferred from main bundle

**Checklist:**
```
[ ] Update imports
[ ] Update upload handler
[ ] Test Excel upload
[ ] Check for chunk in dist/js/
[ ] Verify data parsing still works
```

---

### Priority 3: FilesView/DataExplorer + CSV Parser (80 KiB)
- [ ] Open same files: `src/components/views/FilesView.tsx`
- [ ] Remove: `import Papa from 'papaparse';`
- [ ] Import: `import { parseCSV } from '@/lib/lazy-imports';`
- [ ] Update CSV upload handler
- [ ] Test: Upload CSV file
- [ ] Verify: file-parser-csv chunk created

**Estimated Time:** 15 minutes
**Impact:** ~80 KiB deferred from main bundle

**Checklist:**
```
[ ] Update imports
[ ] Update CSV handler
[ ] Test CSV upload
[ ] Check for chunk in dist/js/
[ ] Verify parsing still works
```

---

### Priority 4: LandingPage + Lenis (30 KiB)
- [ ] Open `src/components/LandingPage.tsx`
- [ ] Find: `import { ReactLenis } from 'lenis/react';`
- [ ] Replace with lazy component wrapper (see guide)
- [ ] Add Suspense wrapper
- [ ] Test: Visit landing page
- [ ] Verify: scroll-lib chunk created

**Estimated Time:** 10 minutes
**Impact:** ~30 KiB deferred (only on landing page)

**Checklist:**
```
[ ] Create LenisWrapper component
[ ] Add lazy import
[ ] Add Suspense with fallback
[ ] Test page loads correctly
[ ] Check for chunk in dist/js/
```

---

### Optional: ChatComponents + Google GenAI
- [ ] Open `src/components/chat/ChatComponents.tsx`
- [ ] Implement lazy loading for GoogleGenerativeAI
- [ ] Use `lazyGoogleGenAI()` when generating responses
- [ ] Test: Generate AI response
- [ ] Verify: genai-lib chunk created

**Estimated Time:** 10 minutes
**Impact:** ~40 KiB deferred (only when generating)

**Checklist:**
```
[ ] Import lazyGoogleGenAI
[ ] Update generateResponse function
[ ] Add error handling for AI loading
[ ] Test chat generation works
[ ] Check for chunk in dist/js/
```

---

## Phase 3: Testing & Validation

### Build & Analyze
- [ ] Run: `npm run build`
- [ ] Run: `npm run analyze:bundle`
- [ ] Compare with baseline sizes
- [ ] Screenshot results for tracking

**Expected Results:**
```
Before:  main-xxxxx.js: ~700 KiB
After:   main-xxxxx.js: ~180-200 KiB (74% reduction)
Plus:    5-6 lazy chunks totaling ~630 KiB loaded on demand
```

### Performance Testing

**Local Testing:**
- [ ] Open DevTools → Network tab
- [ ] Filter: JavaScript files only
- [ ] Throttle: "Slow 4G"
- [ ] Reload page
- [ ] Verify:
  - [ ] Main bundle loads first (~180 KiB)
  - [ ] Lazy chunks don't load until needed
  - [ ] Loading indicators show while chunks load

**Checklist:**
```
[ ] No console errors on page load
[ ] All UI renders correctly
[ ] Lazy chunks load on demand (check Network tab)
[ ] Performance not degraded
[ ] No layout shifts (CLS impact)
```

### Browser Compatibility
- [ ] Test in Chrome/Chromium (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test on mobile (iOS Safari, Chrome Android)

**Checklist:**
```
[ ] No errors in any browser
[ ] Lazy loading works in all browsers
[ ] Fallback UI displays correctly
[ ] File uploads work correctly
```

---

## Phase 4: Performance Monitoring

### Core Web Vitals
- [ ] Run Lighthouse audit (DevTools → Lighthouse)
- [ ] Check:
  - [ ] First Contentful Paint (FCP) - should be <1.8s
  - [ ] Largest Contentful Paint (LCP) - should be <2.5s
  - [ ] Time to Interactive (TTI) - should be <3.5s
  - [ ] Cumulative Layout Shift (CLS) - should be <0.1

**Expected Improvements:**
```
FCP: 2.5s → 1.6s (36% faster)
LCP: 3.2s → 2.1s (34% faster)
TTI: 4.5s → 2.8s (38% faster)
```

### Set Up Production Monitoring
- [ ] Add Web Vitals tracking to App.tsx (see guide)
- [ ] Deploy with analytics
- [ ] Monitor real-world metrics for 24-48 hours
- [ ] Document improvements

**Checklist:**
```
[ ] Web Vitals tracking added
[ ] Deployed to production
[ ] Metrics being collected
[ ] Dashboard accessible
```

---

## Phase 5: Deployment & Rollout

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Bundle analysis complete
- [ ] Performance metrics documented
- [ ] Code reviewed

### Deployment
- [ ] Update main branch with changes
- [ ] Deploy to staging first
- [ ] Test in staging environment (24 hours)
- [ ] Deploy to production
- [ ] Monitor error tracking (Sentry/etc)

### Post-Deployment
- [ ] Monitor Core Web Vitals for 48 hours
- [ ] Check for error spikes
- [ ] Monitor user analytics
- [ ] Verify lazy chunks loading correctly
- [ ] Document results

**Checklist:**
```
[ ] Code changes committed
[ ] Staging deployment successful
[ ] No errors in staging (24h monitoring)
[ ] Production deployment successful
[ ] Real-world metrics improving
[ ] No regression in user experience
```

---

## Size Tracking Table

Fill in sizes after each build:

| Phase | main.js | vendor-* | Total Lazy | Reduction | Status |
|-------|---------|----------|-----------|-----------|--------|
| Baseline | 700 KiB | 236 KiB | - | - | ⏳ |
| P1: Plot | 400 KiB | 236 KiB | 320 KiB | 43% | ⏳ |
| P2: Excel | 250 KiB | 236 KiB | 470 KiB | 64% | ⏳ |
| P3: CSV | 170 KiB | 236 KiB | 550 KiB | 76% | ⏳ |
| P4: Lenis | 160 KiB | 236 KiB | 580 KiB | 77% | ⏳ |
| Final | 180 KiB | 270 KiB | 630 KiB | 74% | ⏳ |

---

## Documentation Links

- **Implementation Guide:** `LAZY_LOADING_IMPLEMENTATION.md`
- **Strategy Overview:** `BUNDLE_OPTIMIZATION_STRATEGY.md`
- **Complete Plan:** `BUNDLE_OPTIMIZATION_COMPLETE.md`
- **Font Optimization:** `FONT_OPTIMIZATION_GUIDE.md`

---

## Quick Commands

```bash
# Build and analyze bundle
npm run build && npm run analyze:bundle

# Visual bundle analysis (install first time)
npm install -D vite-bundle-visualizer
npx vite-bundle-visualizer dist/

# Test with network throttling
# DevTools → Network tab → "Slow 4G"

# Run Lighthouse
# DevTools → Lighthouse → Analyze page load
```

---

## Notes & Progress

### Session 1 Date: ___________
- [ ] Completed Priority 1
- [ ] Completed Priority 2
- [ ] Notes: _________________________________

### Session 2 Date: ___________
- [ ] Completed Priority 3
- [ ] Completed Priority 4
- [ ] Notes: _________________________________

### Deployment Date: ___________
- [ ] Deployed to production
- [ ] Initial metrics: _________________________
- [ ] 48h review: ____________________________

---

## Help & Troubleshooting

**Q: Chunks not loading?**
A: Check Network tab. Make sure Suspense fallback displays. See error boundary section in LAZY_LOADING_IMPLEMENTATION.md

**Q: Error "Cannot find module"?**
A: Make sure lazy-imports.ts is in correct path. Import path must use full path like `@/lib/lazy-imports`

**Q: Performance not improving?**
A: Run `npm run analyze:bundle` to verify chunks are actually created. Check that main.js is smaller.

**Q: Getting 404 errors for chunks?**
A: Vite build might be incomplete. Try: `npm run build -- --mode production` with --force flag

**Q: Want to see detailed breakdown?**
A: Install vite-bundle-visualizer: `npm install -D vite-bundle-visualizer && npx vite-bundle-visualizer dist/`

---

**Last Updated:** 2026-05-09
**Target Completion:** Within 2 weeks
**Expected ROI:** 52% bundle reduction, 36-40% faster page load
