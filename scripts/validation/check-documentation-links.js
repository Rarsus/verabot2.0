#!/usr/bin/env node

/**
 * Documentation Link Validator with Auto-Fix
 * 
 * Validates all internal markdown links in the documentation.
 * Identifies broken links and optionally fixes them automatically.
 * 
 * Usage:
 *   node scripts/validation/check-documentation-links.js
 *   node scripts/validation/check-documentation-links.js --fix (auto-fix broken links)
 *   node scripts/validation/check-documentation-links.js --ignore-archived (skip archived docs)
 *   node scripts/validation/check-documentation-links.js --fix --ignore-archived (both)
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../');
const IGNORE_PATTERNS = ['node_modules', '.git', '.next', 'dist', 'build'];
const EXCLUDE_ARCHIVED = process.argv.includes('--ignore-archived');
const ENABLE_FIX = process.argv.includes('--fix');

/**
 * Extract all markdown links from file content
 * @param {string} content - File content
 * @returns {Array} Array of links found
 */
function findMarkdownLinks(content) {
  const linkPattern = /\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkPattern.exec(content)) !== null) {
    links.push(match[1]);
  }
  
  return links;
}

/**
 * Check if a link is broken
 * @param {string} link - Link to check
 * @param {string} baseDir - Base directory for resolving relative paths
 * @returns {Object} Result with status and resolved path
 */
function checkLink(link, baseDir) {
  // Skip external links
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return { valid: true, type: 'external', link };
  }
  
  // Skip anchors
  if (link.startsWith('#')) {
    return { valid: true, type: 'anchor', link };
  }
  
  // Handle mail links
  if (link.startsWith('mailto:')) {
    return { valid: true, type: 'email', link };
  }
  
  // Remove anchor from file path
  const [filePath] = link.split('#');
  
  if (!filePath) {
    return { valid: true, type: 'anchor-only', link };
  }
  
  // Resolve relative path
  const resolvedPath = path.resolve(baseDir, filePath);
  
  // Check if file exists
  const exists = fs.existsSync(resolvedPath);
  
  return {
    valid: exists,
    type: 'file',
    link,
    filePath,
    resolvedPath
  };
}

/**
 * Recursively find all markdown files
 * @param {string} dir - Directory to search
 * @param {Array} files - Accumulator for files
 * @returns {Array} Array of markdown file paths
 */
function findMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = path.relative(ROOT_DIR, fullPath);
    
    // Skip ignored patterns
    if (IGNORE_PATTERNS.some(pattern => relPath.includes(pattern))) {
      continue;
    }
    
    // Skip archived if requested
    if (EXCLUDE_ARCHIVED && relPath.includes('archived')) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (entry.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Find the actual path of a directory with case-insensitive matching
 * Walks up the path and matches each component case-insensitively
 */
function findCaseInsensitivePath(targetPath) {
  const parts = targetPath.split(path.sep).filter(p => p);
  let current = targetPath.startsWith(path.sep) ? path.sep : '.';
  
  for (const part of parts) {
    if (current === '.') {
      // Starting from current directory
      current = part;
    } else {
      // Check if this part exists as-is
      const fullPath = path.join(current, part);
      if (fs.existsSync(fullPath)) {
        current = fullPath;
        continue;
      }
      
      // Try case-insensitive match
      try {
        const entries = fs.readdirSync(current);
        const match = entries.find(e => e.toLowerCase() === part.toLowerCase());
        if (match) {
          current = path.join(current, match);
          continue;
        }
      } catch (error) {
        // Directory doesn't exist
        return null;
      }
      
      // No match found
      return null;
    }
  }
  
  return current;
}

/**
 * Find case-insensitive file match for a broken path
 * Searches the directory for a file matching case-insensitively
 * @param {string} brokenPath - Path to the broken link
 * @returns {string|null} Resolved path if found, null otherwise
 */
function findCaseInsensitiveMatch(brokenPath) {
  try {
    // Parse the path
    const dir = path.dirname(brokenPath);
    const filename = path.basename(brokenPath);
    
    // Check if directory exists (case-insensitive)
    const actualDir = findCaseInsensitivePath(dir);
    if (!actualDir) {
      return null;
    }
    
    // List files in directory
    const files = fs.readdirSync(actualDir);
    
    // Find case-insensitive match
    const match = files.find(f => f.toLowerCase() === filename.toLowerCase());
    
    if (match) {
      return path.join(actualDir, match);
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Replace a link in a markdown file
 * @param {string} mdFile - Path to markdown file
 * @param {string} oldLink - Old link to replace
 * @param {string} newLink - New link to use
 */
function replaceLinkInFile(mdFile, oldLink, newLink) {
  try {
    let content = fs.readFileSync(mdFile, 'utf-8');
    
    // Escape special regex characters in oldLink
    const escapedLink = oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Handle links with and without anchors
    // Pattern: ](oldLink) or ](oldLink#anchor)
    const linkPattern = new RegExp(`\\]\\(${escapedLink}(?:(#[^)]+))?\\)`, 'g');
    
    content = content.replace(linkPattern, (match, anchor) => {
      return `](${newLink}${anchor || ''})`;
    });
    
    fs.writeFileSync(mdFile, content, 'utf-8');
  } catch (error) {
    // Silently skip if file can't be written
  }
}

/**
 * Auto-fix links in a markdown file
 * Attempts to fix broken links by finding case-insensitive matches
 * @param {string} mdFile - Path to markdown file
 * @param {string} baseDir - Base directory for resolving relative paths
 * @returns {Object} Summary of fixes
 */
function autoFixLinks(mdFile, baseDir) {
  const results = {
    count: 0,
    fixes: []
  };
  
  try {
    const content = fs.readFileSync(mdFile, 'utf-8');
    const links = findMarkdownLinks(content);
    const fileDir = path.dirname(mdFile);
    
    for (const link of links) {
      // Skip external links
      if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:')) {
        continue;
      }
      
      // Skip anchor-only links
      if (link.startsWith('#')) {
        continue;
      }
      
      // Split link and anchor
      const [filePath, anchor] = link.split('#');
      
      if (!filePath) {
        continue;
      }
      
      // Check if link is already valid
      const resolvedPath = path.resolve(fileDir, filePath);
      if (fs.existsSync(resolvedPath)) {
        continue;
      }
      
      // Try to find case-insensitive match
      const fixedPath = findCaseInsensitiveMatch(resolvedPath);
      
      if (fixedPath) {
        // Calculate relative path from file location
        const newRelativePath = path.relative(fileDir, fixedPath);
        // Preserve leading ./ if original had it
        const prefix = filePath.startsWith('./') ? './' : '';
        const newLink = prefix + newRelativePath.replace(/\\/g, '/'); // Use forward slashes
        
        // Build new link with anchor if present
        const newLinkWithAnchor = anchor ? `${newLink}#${anchor}` : newLink;
        
        // Only fix if different (case-sensitive comparison)
        if (newLinkWithAnchor !== link) {
          replaceLinkInFile(mdFile, link, newLinkWithAnchor);
          results.count++;
          results.fixes.push({
            oldLink: link,
            newLink: newLinkWithAnchor,
            file: path.relative(ROOT_DIR, mdFile)
          });
        }
      }
    }
  } catch (error) {
    // Silently handle errors
  }
  
  return results;
}

/**
 * Main validation function
 */
function validateDocumentation() {
  console.log('🔍 Scanning documentation for broken links...\n');
  
  const mdFiles = findMarkdownFiles(ROOT_DIR);
  console.log(`📄 Found ${mdFiles.length} markdown files\n`);
  
  const results = {
    total: 0,
    valid: 0,
    broken: 0,
    external: 0,
    fixed: 0,
    byFile: {}
  };
  
  const brokenLinks = {};
  const fixedLinks = [];
  
  // Check each file
  for (const mdFile of mdFiles) {
    const relPath = path.relative(ROOT_DIR, mdFile);
    
    try {
      const content = fs.readFileSync(mdFile, 'utf-8');
      const links = findMarkdownLinks(content);
      
      if (links.length === 0) continue;
      
      const fileDir = path.dirname(mdFile);
      const fileBrokenLinks = [];
      
      for (const link of links) {
        results.total++;
        const checkResult = checkLink(link, fileDir);
        
        if (checkResult.type === 'external') {
          results.external++;
        } else if (checkResult.valid) {
          results.valid++;
        } else {
          results.broken++;
          fileBrokenLinks.push({
            link: checkResult.link,
            resolvedPath: checkResult.resolvedPath
          });
        }
      }
      
      if (fileBrokenLinks.length > 0) {
        brokenLinks[relPath] = fileBrokenLinks;
        results.byFile[relPath] = fileBrokenLinks.length;
      }
      
      // Auto-fix if enabled
      if (ENABLE_FIX && fileBrokenLinks.length > 0) {
        const fixResults = autoFixLinks(mdFile, fileDir);
        if (fixResults.count > 0) {
          results.fixed += fixResults.count;
          fixedLinks.push({
            file: relPath,
            fixes: fixResults.fixes
          });
          
          // Re-check links after fixing
          const updatedContent = fs.readFileSync(mdFile, 'utf-8');
          const updatedLinks = findMarkdownLinks(updatedContent);
          const updatedBrokenLinks = [];
          
          for (const link of updatedLinks) {
            const checkResult = checkLink(link, fileDir);
            if (checkResult.type !== 'external' && !checkResult.valid) {
              updatedBrokenLinks.push({
                link: checkResult.link,
                resolvedPath: checkResult.resolvedPath
              });
            }
          }
          
          // Update broken links count
          if (updatedBrokenLinks.length < fileBrokenLinks.length) {
            results.broken -= (fileBrokenLinks.length - updatedBrokenLinks.length);
            brokenLinks[relPath] = updatedBrokenLinks;
            if (updatedBrokenLinks.length === 0) {
              delete brokenLinks[relPath];
              delete results.byFile[relPath];
            } else {
              results.byFile[relPath] = updatedBrokenLinks.length;
            }
          }
        }
      }
    } catch (error) {
      console.error(`⚠️  Error reading file ${relPath}: ${error.message}`);
    }
  }
  
  // Print summary
  console.log('📊 SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Total links scanned:     ${results.total}`);
  console.log(`Valid links:             ${results.valid}`);
  console.log(`External links:          ${results.external}`);
  console.log(`Broken links:            ${results.broken}`);
  console.log(`Files with broken links: ${Object.keys(brokenLinks).length}`);
  
  if (ENABLE_FIX) {
    console.log(`Links fixed:             ${results.fixed}`);
  }
  console.log();
  
  // Print fixed links if any
  if (fixedLinks.length > 0) {
    console.log('✅ LINKS FIXED\n');
    for (const fixedFile of fixedLinks) {
      console.log(`📄 ${fixedFile.file}`);
      for (const fix of fixedFile.fixes) {
        console.log(`   ✓ ${fix.oldLink}`);
        console.log(`     → ${fix.newLink}`);
      }
      console.log();
    }
  }
  
  // Print broken links
  if (Object.keys(brokenLinks).length > 0) {
    console.log('❌ BROKEN LINKS FOUND\n');
    
    const sortedFiles = Object.keys(brokenLinks).sort();
    
    for (const file of sortedFiles) {
      console.log(`📄 ${file}`);
      
      for (const brokenLink of brokenLinks[file]) {
        console.log(`   ❌ ${brokenLink.link}`);
        console.log(`      → ${brokenLink.resolvedPath}`);
      }
      console.log();
    }
    
    if (ENABLE_FIX) {
      console.log('💡 Run with --fix to automatically fix case-sensitivity issues');
    } else {
      console.log('💡 Run with --fix to automatically fix case-sensitivity issues');
    }
    
    return 1; // Exit with error
  } else {
    console.log('✅ All links are valid!\n');
    return 0; // Success
  }
}

// Run validation
const exitCode = validateDocumentation();
process.exit(exitCode);
