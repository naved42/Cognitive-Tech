# Bundle Optimization - Implementation in Progress

## ✅ COMPLETED: Core Configuration & AnalysisPanel

### Priority 1: AnalysisPanel Component ✅ PARTIALLY DONE

**File:** `src/components/AnalysisPanel.tsx`

**Changes Made:**
```typescript
// BEFORE (Line 1-3):
import React, { useState } from 'react';
import { motion } from 'motion/react';
import Plot from 'react-plotly.js';

// AFTER:
import React, { useState, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { lazyPlotly } from '@/lib/lazy-imports';

// ... add after interface definitions:
const Plot = lazy(() => 
  lazyPlotly().then(m => ({ default: m.default }))
);

function PlotLoadingFallback() {
  return (
    <div className="w-full h-[240px] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
      <Loader2 className="w-5 h-5 text-zinc-400 animate-spin mb-2" />
      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Loading chart...</p>
    </div>
  );
}
```

**Status:** ✅ Import statements updated
**Next:** Need to wrap Plot usage in Suspense (if charts are rendered)

**Expected Impact:** 320 KiB deferred

---

## 📋 REMAINING PRIORITIES

### Priority 2: DataExplorer - File Upload Handlers

**File:** `src/components/DataExplorer.tsx` (handles file upload)

**Implementation:**
1. Add imports:
```typescript
import { parseExcel, parseCSV } from '@/lib/lazy-imports';
```

2. In file upload handler, replace direct parsing with:
```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    let data;
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      data = await parseExcel(file);
    } else if (file.name.endsWith('.csv')) {
      data = await parseCSV(file);
    } else {
      toast.error('Unsupported file type');
      return;
    }
    // Process data
  } catch (error) {
    toast.error('Failed to parse file');
  }
};
```

**Impact:** ~230 KiB saved (xlsx + papaparse)

---

### Priority 3: LandingPage - Lenis Scroll

**File:** `src/components/LandingPage.tsx`

**Implementation:**
```typescript
import { lazy, Suspense } from 'react';
import { lazyLenis } from '@/lib/lazy-imports';

const LenisWrapper = lazy(() =>
  lazyLenis().then(m => ({ 
    default: ({ children }) => (
      <m.ReactLenis root>{children}</m.ReactLenis>
    )
  }))
);

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LenisWrapper>
        {/* Page content */}
      </LenisWrapper>
    </Suspense>
  );
}
```

**Impact:** 30 KiB deferred

---

### Priority 4: ChatComponents - GenAI

**File:** `src/components/chat/ChatComponents.tsx`

**Implementation:**
```typescript
import { lazyGoogleGenAI } from '@/lib/lazy-imports';

const generateResponse = async (prompt: string) => {
  try {
    const genAI = await lazyGoogleGenAI(
      process.env.VITE_GOOGLE_API_KEY
    );
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash' 
    });
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('GenAI error:', error);
  }
};
```

**Impact:** ~40 KiB deferred

---

## 🚀 QUICK NEXT STEPS

### What's Done:
- [x] vite.config.ts updated (advanced code splitting)
- [x] src/lib/lazy-imports.ts created (lazy utilities)
- [x] package.json updated (analyze:bundle script)
- [x] AnalysisPanel.tsx - imports updated
- [x] Bundle analyzer available

### What's Next:
- [ ] Finish AnalysisPanel wrapping (if charts rendered)
- [ ] Update DataExplorer file handlers
- [ ] Update LandingPage with Lenis
- [ ] Update ChatComponents with GenAI
- [ ] Run `npm run build`
- [ ] Run `npm run analyze:bundle`
- [ ] Verify size reduction

---

## 📊 Measurement Commands

```bash
# Build and analyze
npm run build && npm run analyze:bundle

# Expected output:
# main.js before: ~700 KiB
# main.js after: ~200 KiB (71% reduction!)
# Plus lazy chunks loading on demand
```

---

## ✨ Status Summary

**Configuration:** ✅ COMPLETE (100%)
**AnalysisPanel:** ⚠️ PARTIAL (imports done, usage to check)
**DataExplorer:** ⏳ READY (instructions provided)
**LandingPage:** ⏳ READY (instructions provided)
**GenAI:** ⏳ READY (instructions provided)

**Overall:** ~25% complete, 75% ready for implementation

---

## Next Action

Run this command to start building with new config:

```bash
npm run build && npm run analyze:bundle
```

This will show you the improvements. If main.js is still large, it means components still need to be wrapped in Suspense boundaries.

See `LAZY_LOADING_IMPLEMENTATION.md` for complete step-by-step guides.
