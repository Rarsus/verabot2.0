/**
 * Link Validation Script
 * Checks for broken internal and external links in documentation files
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const DOCS_DIR = path.join(__dirname, '../../docs');
const ROOT_DIR = path.join(__dirname, '../..');
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'package-lock.json'
];

// Track results
const results = {
  totalFiles: 0,
  totalLinks: 0,
  brokenLinks: [],
  warnings: []
};

/**
 * Extract links from markdown content
 */
function extractLinks(content) {
  const links = [];

  // Match markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownLinkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      type: 'markdown'
    });
  }

  // Match HTML links <a href="url">
  const htmlLinkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']/gi;
  while ((match = htmlLinkRegex.exec(content)) !== null) {
    links.push({
      text: 'HTML link',
      url: match[1],
      type: 'html'
    });
  }

  return links;
}

/**
 * Check if internal file exists
 */
function checkInternalLink(filePath, linkUrl, basePath) {
  // Remove anchor/hash
  const urlWithoutAnchor = linkUrl.split('#')[0];

  if (!urlWithoutAnchor) {
    return true; // Just an anchor, valid
  }

  // Construct full path
  const linkPath = path.join(path.dirname(basePath), urlWithoutAnchor);

  // Check if file exists
  if (fs.existsSync(linkPath)) {
    return true;
  }

  // Try relative to docs directory
  const docsPath = path.join(DOCS_DIR, urlWithoutAnchor);
  if (fs.existsSync(docsPath)) {
    return true;
  }

  // Try relative to root
  const rootPath = path.join(ROOT_DIR, urlWithoutAnchor);
  if (fs.existsSync(rootPath)) {
    return true;
  }

  return false;
}

/**
 * Check if external URL is accessible
 */
function checkExternalLink(url) {
  return new Promise((resolve) => {
    // Check if we're in a restricted network environment
    const isCI = process.env.CI === 'true';

    const protocol = url.startsWith('https') ? https : http;

    const options = {
      method: 'HEAD',
      timeout: 5000,
      headers: {
        'User-Agent': 'VeraBot-Link-Checker/1.0'
      }
    };

    const req = protocol.request(url, options, (res) => {
      // Accept 2xx and 3xx status codes
      if (res.statusCode >= 200 && res.statusCode < 400) {
        resolve({ valid: true, status: res.statusCode });
      } else {
        resolve({ valid: false, status: res.statusCode, error: `Status ${res.statusCode}` });
      }
    });

    req.on('error', (err) => {
      // In CI, treat network errors as warnings instead of failures for external links
      if (isCI && (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT')) {
        resolve({ valid: true, warning: true, error: err.message });
      } else {
        resolve({ valid: false, error: err.message });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      // In CI, treat timeouts as warnings
      if (isCI) {
        resolve({ valid: true, warning: true, error: 'Timeout' });
      } else {
        resolve({ valid: false, error: 'Timeout' });
      }
    });

    req.end();
  });
}

/**
 * Process a single markdown file
 */
async function processFile(filePath) {
  results.totalFiles++;

  const content = fs.readFileSync(filePath, 'utf8');
  const links = extractLinks(content);

  // Check if we're in CI environment with firewall restrictions
  const isCI = process.env.CI === 'true';

  for (const link of links) {
    results.totalLinks++;

    const url = link.url;

    // Skip certain URLs
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) {
      continue;
    }

    // Check if it's an external or internal link
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // External link - skip in CI due to firewall restrictions
      if (isCI) {
        // Don't validate external links in CI - firewall blocks them
        continue;
      }

      // External link - check accessibility (only in non-CI environments)
      const result = await checkExternalLink(url);
      if (!result.valid) {
        results.brokenLinks.push({
          file: path.relative(ROOT_DIR, filePath),
          link: url,
          text: link.text,
          error: result.error || 'Inaccessible',
          type: 'external'
        });
      } else if (result.warning) {
        results.warnings.push({
          file: path.relative(ROOT_DIR, filePath),
          link: url,
          text: link.text,
          error: result.error || 'Network issue (CI)',
          type: 'external'
        });
      }
    } else {
      // Internal link - check file exists
      const exists = checkInternalLink(filePath, url, filePath);
      if (!exists) {
        results.brokenLinks.push({
          file: path.relative(ROOT_DIR, filePath),
          link: url,
          text: link.text,
          error: 'File not found',
          type: 'internal'
        });
      }
    }
  }
}

/**
 * Recursively find all markdown files
 */
function findMarkdownFiles(dir) {
  const files = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip ignored patterns
    if (IGNORE_PATTERNS.some(pattern => fullPath.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Generate report
 */
function generateReport() {
  const isCI = process.env.CI === 'true';

  console.log('\n=== Link Validation Report ===\n');
  console.log(`Files scanned: ${results.totalFiles}`);
  console.log(`Links checked: ${results.totalLinks}`);

  if (isCI) {
    console.log('⚠️  External links skipped (CI environment with firewall restrictions)');
  }

  console.log(`Broken links: ${results.brokenLinks.length}`);
  console.log(`Warnings: ${results.warnings.length}\n`);

  if (results.warnings.length > 0) {
    console.log('⚠️  Link Warnings (network issues in CI):\n');

    for (const warning of results.warnings) {
      console.log(`File: ${warning.file}`);
      console.log(`  Link: ${warning.link}`);
      console.log(`  Text: ${warning.text}`);
      console.log(`  Warning: ${warning.error}\n`);
    }
  }

  if (results.brokenLinks.length > 0) {
    console.log('❌ Broken Links Found:\n');

    for (const broken of results.brokenLinks) {
      console.log(`File: ${broken.file}`);
      console.log(`  Link: ${broken.link}`);
      console.log(`  Text: ${broken.text}`);
      console.log(`  Error: ${broken.error}`);
      console.log(`  Type: ${broken.type}\n`);
    }

    return false;
  } else {
    console.log('✅ All links are valid!');
    if (isCI) {
      console.log('   (Internal links only - external links skipped due to firewall)');
    }
    return true;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔍 Starting link validation...\n');

    // Check if we're in CI environment
    const isCI = process.env.CI === 'true';
    if (isCI) {
      console.log('⚠️  Running in CI environment with firewall restrictions');
      console.log('📝 External link validation will be skipped\n');
    }

    // Find all markdown files
    const markdownFiles = findMarkdownFiles(ROOT_DIR);

    console.log(`Found ${markdownFiles.length} markdown files\n`);

    // Process each file
    for (const file of markdownFiles) {
      const relativePath = path.relative(ROOT_DIR, file);
      process.stdout.write(`Checking ${relativePath}...`);
      await processFile(file);
      process.stdout.write(' ✓\n');
    }

    // Generate report
    const allValid = generateReport();

    if (!allValid) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error during link validation:', err.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  extractLinks,
  checkInternalLink,
  checkExternalLink,
  processFile,
  findMarkdownFiles
};
