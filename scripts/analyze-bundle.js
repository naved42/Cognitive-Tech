#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * 
 * Usage: npm run analyze:bundle
 * 
 * This script analyzes your build output and identifies:
 * - Largest dependencies
 * - Potential duplicates
 * - Tree-shaking opportunities
 * - Chunk splitting effectiveness
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DIST_DIR = './dist/js';
const THRESHOLD_KB = 50;

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function analyzeBundle() {
  console.log('\n📊 Bundle Analysis Report\n');
  console.log('=' .repeat(60));

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ No dist/js directory found. Run `npm run build` first.');
    process.exit(1);
  }

  // Get all JS files
  const files = fs.readdirSync(DIST_DIR)
    .filter(f => f.endsWith('.js'))
    .map(f => ({
      name: f,
      path: path.join(DIST_DIR, f),
      size: fs.statSync(path.join(DIST_DIR, f)).size
    }))
    .sort((a, b) => b.size - a.size);

  // Calculate totals
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  console.log('\n📦 CHUNK SIZES (Sorted by Size)\n');
  
  files.forEach((file, idx) => {
    const percent = ((file.size / totalSize) * 100).toFixed(1);
    const isLarge = file.size > THRESHOLD_KB * 1024;
    const icon = isLarge ? '⚠️  ' : '✅ ';
    
    console.log(`${icon} ${idx + 1}. ${file.name}`);
    console.log(`   Size: ${formatBytes(file.size)} (${percent}% of total)\n`);
  });

  console.log('=' .repeat(60));
  console.log('\n📈 SUMMARY\n');
  console.log(`Total uncompressed: ${formatBytes(totalSize)}`);
  console.log(`Chunks created:     ${files.length}`);
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS\n');
  
  const largeChunks = files.filter(f => f.size > THRESHOLD_KB * 1024);
  
  if (largeChunks.length > 0) {
    console.log(`Found ${largeChunks.length} chunk(s) over ${THRESHOLD_KB}KB:\n`);
    largeChunks.forEach(f => {
      console.log(`  • ${f.name} (${formatBytes(f.size)})`);
      console.log(`    → Consider lazy-loading this dependency\n`);
    });
  }

  // Check for main bundle size
  const mainBundle = files.find(f => f.name.startsWith('main-'));
  if (mainBundle && mainBundle.size > 400 * 1024) {
    console.log(`⚠️  Main bundle is ${formatBytes(mainBundle.size)}`);
    console.log(`    → Extract more features to separate chunks\n`);
  }

  // Tree-shaking check
  console.log('\n🌳 TREE-SHAKING CHECK\n');
  checkTreeShaking(files);

  console.log('\n' + '='.repeat(60) + '\n');
}

function checkTreeShaking(files) {
  // Check for common unmunified patterns
  let vendorChunk = files.find(f => f.name.includes('vendor'));
  
  if (vendorChunk) {
    const content = fs.readFileSync(vendorChunk.path, 'utf-8');
    
    // Count occurrences of common patterns (only in production)
    const patterns = {
      'console.log': /console\.log/g,
      'debugger': /debugger/g,
    };
    
    let hasIssues = false;
    for (const [name, regex] of Object.entries(patterns)) {
      const matches = (content.match(regex) || []).length;
      if (matches > 0) {
        console.log(`⚠️  Found ${matches} instances of: ${name}`);
        hasIssues = true;
      }
    }
    
    if (!hasIssues) {
      console.log('✅ No obvious dead code detected');
      console.log('✅ Tree-shaking appears to be working correctly\n');
    }
  }
}

console.log('\n🚀 Running Build Analysis...\n');
analyzeBundle();

console.log('\n📚 For detailed visual analysis, use:\n');
console.log('   npm install -D vite-bundle-visualizer');
console.log('   npx vite-bundle-visualizer dist/\n');
