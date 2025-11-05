#!/usr/bin/env node
// Smart cache cleaner - only clears cache when it exceeds a threshold

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Cache size threshold (in MB) - clear cache if it exceeds this
const CACHE_THRESHOLD_MB = 500; // 500MB threshold
const CACHE_DIR = path.join(process.cwd(), '.next');

function getCacheSize() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      return 0;
    }
    
    // Get size of .next directory in MB
    const sizeInBytes = execSync(`du -sb "${CACHE_DIR}" 2>/dev/null || echo 0`, { encoding: 'utf-8' }).trim().split('\t')[0];
    const sizeInMB = parseInt(sizeInBytes) / (1024 * 1024);
    return sizeInMB;
  } catch (error) {
    return 0;
  }
}

function clearCache() {
  try {
    console.log('🧹 Clearing cache...');
    execSync(`rm -rf "${CACHE_DIR}"`, { stdio: 'inherit' });
    console.log('✅ Cache cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error.message);
    return false;
  }
}

function main() {
  const cacheSize = getCacheSize();
  
  console.log(`📊 Current cache size: ${cacheSize.toFixed(2)} MB`);
  console.log(`🎯 Cache threshold: ${CACHE_THRESHOLD_MB} MB`);
  
  if (cacheSize > CACHE_THRESHOLD_MB) {
    console.log(`⚠️  Cache exceeds threshold (${cacheSize.toFixed(2)} MB > ${CACHE_THRESHOLD_MB} MB)`);
    clearCache();
  } else {
    console.log(`✅ Cache size is within limits, no cleaning needed`);
  }
}

main();

