/**
 * Version Synchronization Checker
 * Ensures version numbers are consistent across all files
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '../..');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');

// Files to check for version consistency
const VERSION_FILES = [
  'README.md',
  'CHANGELOG.md',
  'docs/README.md',
  'docs/INDEX.md'
];

// Track results
const results = {
  packageVersion: null,
  filesChecked: 0,
  inconsistencies: [],
  warnings: []
};

/**
 * Get version from package.json
 */
function getPackageVersion() {
  try {
    const packageData = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    return packageData.version;
  } catch (err) {
    throw new Error(`Failed to read package.json: ${err.message}`);
  }
}

/**
 * Extract version references from file content
 */
function extractVersions(content, filePath) {
  const versions = [];
  
  // Match version patterns like v1.0.0, version 1.0.0, etc.
  const patterns = [
    /version[:\s]+v?(\d+\.\d+\.\d+)/gi,
    /v(\d+\.\d+\.\d+)/g,
    /\*\*Version:\*\*\s*v?(\d+\.\d+\.\d+)/gi,
    /Current Version[:\s]+v?(\d+\.\d+\.\d+)/gi
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      versions.push({
        version: match[1],
        pattern: match[0],
        index: match.index
      });
    }
  }
  
  return versions;
}

/**
 * Check version consistency in a file
 */
function checkFile(filePath, expectedVersion) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    results.warnings.push({
      file: filePath,
      message: 'File not found'
    });
    return;
  }
  
  results.filesChecked++;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const versions = extractVersions(content, filePath);
  
  // Check each version found
  for (const versionInfo of versions) {
    if (versionInfo.version !== expectedVersion) {
      results.inconsistencies.push({
        file: filePath,
        expected: expectedVersion,
        found: versionInfo.version,
        context: versionInfo.pattern
      });
    }
  }
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n=== Version Consistency Report ===\n');
  console.log(`Package version: ${results.packageVersion}`);
  console.log(`Files checked: ${results.filesChecked}`);
  console.log(`Inconsistencies found: ${results.inconsistencies.length}\n`);
  
  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    for (const warning of results.warnings) {
      console.log(`  ${warning.file}: ${warning.message}`);
    }
    console.log();
  }
  
  if (results.inconsistencies.length > 0) {
    console.log('❌ Version Inconsistencies Found:\n');
    
    for (const inconsistency of results.inconsistencies) {
      console.log(`File: ${inconsistency.file}`);
      console.log(`  Expected: ${inconsistency.expected}`);
      console.log(`  Found: ${inconsistency.found}`);
      console.log(`  Context: "${inconsistency.context}"\n`);
    }
    
    return false;
  } else {
    console.log('✅ All version numbers are consistent!');
    return true;
  }
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🔍 Starting version consistency check...\n');
    
    // Get package version
    results.packageVersion = getPackageVersion();
    console.log(`Reference version from package.json: ${results.packageVersion}\n`);
    
    // Check each file
    for (const file of VERSION_FILES) {
      process.stdout.write(`Checking ${file}...`);
      checkFile(file, results.packageVersion);
      process.stdout.write(' ✓\n');
    }
    
    // Generate report
    const allConsistent = generateReport();
    
    if (!allConsistent) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error during version check:', err.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  getPackageVersion,
  extractVersions,
  checkFile,
  generateReport
};
