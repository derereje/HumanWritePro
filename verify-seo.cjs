#!/usr/bin/env node
// SEO Verification Script for acoustictext.com
// Run with: node verify-seo.js

const fs = require('fs');
const path = require('path');

console.log('🔍 SEO Setup Verification for acoustictext.com\n');
console.log('='.repeat(70) + '\n');

let errors = 0;
let warnings = 0;
let passed = 0;

// Check 1: Sitemap exists
console.log('✓ Checking sitemap.xml...');
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
  
  // Check for valid XML declaration
  if (sitemap.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
    console.log('  ✅ Valid XML declaration');
    passed++;
  } else {
    console.log('  ❌ Missing XML declaration');
    errors++;
  }
  
  // Check for proper namespace
  if (sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    console.log('  ✅ Valid sitemap namespace');
    passed++;
  } else {
    console.log('  ❌ Invalid or missing namespace');
    errors++;
  }
  
  // Check date format
  if (sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}<\/lastmod>/)) {
    console.log('  ✅ Valid ISO 8601 date format');
    passed++;
  } else if (sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/)) {
    console.log('  ⚠️  Date format missing time (should include T00:00:00+00:00)');
    warnings++;
  } else {
    console.log('  ❌ Invalid date format');
    errors++;
  }
  
  // Count URLs
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  console.log(`  ℹ️  URLs in sitemap: ${urlCount}`);
  if (urlCount >= 7) {
    console.log('  ✅ All expected pages present');
    passed++;
  } else {
    console.log('  ⚠️  Missing some pages (expected 7+)');
    warnings++;
  }
  
  // Check for required pages
  const requiredPages = ['/', '/pricing', '/help-center', '/contact', '/privacy'];
  requiredPages.forEach(page => {
    if (sitemap.includes(`https://acoustictext.com${page}`)) {
      console.log(`  ✅ Found: ${page}`);
      passed++;
    } else {
      console.log(`  ❌ Missing: ${page}`);
      errors++;
    }
  });
  
} else {
  console.log('  ❌ sitemap.xml not found!');
  errors++;
}

console.log('\n' + '-'.repeat(70) + '\n');

// Check 2: Robots.txt exists
console.log('✓ Checking robots.txt...');
const robotsPath = path.join(__dirname, 'public', 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf-8');
  
  // Check User-agent
  if (robots.includes('User-agent: *')) {
    console.log('  ✅ User-agent declared');
    passed++;
  } else {
    console.log('  ❌ Missing User-agent');
    errors++;
  }
  
  // Check Sitemap reference
  if (robots.includes('Sitemap: https://www.acoustictext.com/sitemap.xml')) {
    console.log('  ✅ Sitemap URL present');
    passed++;
  } else {
    console.log('  ⚠️  Sitemap URL missing or incorrect');
    warnings++;
  }
  
  // Check API blocking
  if (robots.includes('Disallow: /api/')) {
    console.log('  ✅ API routes blocked');
    passed++;
  } else {
    console.log('  ⚠️  API routes not blocked (security concern)');
    warnings++;
  }
  
  // Check for Allow directives
  const allowCount = (robots.match(/Allow: \//g) || []).length;
  console.log(`  ℹ️  Allow directives: ${allowCount}`);
  if (allowCount >= 5) {
    console.log('  ✅ Public pages allowed');
    passed++;
  } else {
    console.log('  ⚠️  Few pages explicitly allowed');
    warnings++;
  }
  
} else {
  console.log('  ❌ robots.txt not found!');
  errors++;
}

console.log('\n' + '-'.repeat(70) + '\n');

// Check 3: Next.js dynamic routes
console.log('✓ Checking Next.js dynamic routes...');
const sitemapTsPath = path.join(__dirname, 'src', 'app', 'sitemap.ts');
const robotsTsPath = path.join(__dirname, 'src', 'app', 'robots.ts');

if (fs.existsSync(sitemapTsPath)) {
  console.log('  ✅ Dynamic sitemap route exists (src/app/sitemap.ts)');
  passed++;
} else {
  console.log('  ⚠️  No dynamic sitemap route (static only)');
  warnings++;
}

if (fs.existsSync(robotsTsPath)) {
  console.log('  ✅ Dynamic robots route exists (src/app/robots.ts)');
  passed++;
} else {
  console.log('  ⚠️  No dynamic robots route (static only)');
  warnings++;
}

console.log('\n' + '-'.repeat(70) + '\n');

// Check 4: Layout metadata
console.log('✓ Checking layout.tsx metadata...');
const layoutPath = path.join(__dirname, 'src', 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layout = fs.readFileSync(layoutPath, 'utf-8');
  
  if (layout.includes('metadataBase')) {
    console.log('  ✅ metadataBase configured');
    passed++;
  } else {
    console.log('  ⚠️  metadataBase not set (affects relative URLs)');
    warnings++;
  }
  
  if (layout.includes('openGraph')) {
    console.log('  ✅ OpenGraph tags configured');
    passed++;
  } else {
    console.log('  ⚠️  No OpenGraph tags (affects social sharing)');
    warnings++;
  }
  
  if (layout.includes('twitter')) {
    console.log('  ✅ Twitter card configured');
    passed++;
  } else {
    console.log('  ⚠️  No Twitter card (affects Twitter sharing)');
    warnings++;
  }
  
  if (layout.includes('robots')) {
    console.log('  ✅ Robots directives configured');
    passed++;
  } else {
    console.log('  ⚠️  No robots meta configuration');
    warnings++;
  }
  
  if (layout.includes('keywords')) {
    console.log('  ✅ SEO keywords defined');
    passed++;
  } else {
    console.log('  ⚠️  No keywords meta (less important but helpful)');
    warnings++;
  }
  
} else {
  console.log('  ❌ layout.tsx not found!');
  errors++;
}

console.log('\n' + '='.repeat(70) + '\n');

// Summary
console.log('📊 VERIFICATION SUMMARY\n');
console.log(`✅ Passed:   ${passed} checks`);
console.log(`⚠️  Warnings: ${warnings} checks`);
console.log(`❌ Errors:   ${errors} checks`);

console.log('\n' + '='.repeat(70) + '\n');

if (errors === 0 && warnings === 0) {
  console.log('🎉 PERFECT! All SEO checks passed!\n');
  console.log('Next steps:');
  console.log('1. Deploy to production');
  console.log('2. Submit sitemap to Google Search Console');
  console.log('3. Request indexing for main pages\n');
} else if (errors === 0) {
  console.log('✅ GOOD! SEO setup is functional with minor warnings.\n');
  console.log('Consider addressing warnings for optimal SEO.\n');
} else {
  console.log('⚠️  ATTENTION NEEDED! Please fix the errors above.\n');
  process.exit(1);
}

// Testing URLs (informational)
console.log('🌐 URLs to test after deployment:\n');
console.log('Sitemap:');
console.log('  • https://www.acoustictext.com/sitemap.xml');
console.log('  • https://www.acoustictext.com/sitemap.xml');
console.log('  • https://www.acoustictext.com/sitemap (dynamic route)\n');
console.log('Robots:');
console.log('  • https://www.acoustictext.com/robots.txt');
console.log('  • https://www.acoustictext.com/robots.txt');
console.log('  • https://www.acoustictext.com/robots (dynamic route)\n');

console.log('📝 Google Search Console:');
console.log('  1. Add property: acoustictext.com');
console.log('  2. Verify ownership');
console.log('  3. Submit sitemap');
console.log('  4. Request indexing\n');

console.log('✅ SEO setup verification complete!\n');
