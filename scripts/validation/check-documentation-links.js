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
 * 
 * Ignore Configuration:
 *   Create a .link-validator-ignore.json file in the project root to ignore specific
 *   broken links that are tracked in GitHub issues.
 *   See .link-validator-ignore.json.example for format.
 * 
 *   Example ignore rule:
 *   {
 *     "ignoreRules": [
 *       {
 *         "file": "docs/reference/INDEX.md",
 *         "exactLink": "project/REFACTORING-COMPLETE.md",
 *         "issue": "123",
 *         "comment": "Tracked for removal in issue #123"
 *       }
 *     ]
 *   }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../');
const IGNORE_PATTERNS = ['node_modules', '.git', '.next', 'dist', 'build'];
const EXCLUDE_ARCHIVED = process.argv.includes('--ignore-archived');
const ENABLE_FIX = process.argv.includes('--fix');
const DETECT_RENAMES = process.argv.includes('--detect-renames') || ENABLE_FIX;
const IGNORE_CONFIG_FILE = path.join(ROOT_DIR, '.link-validator-ignore.json');

// Load ignore configuration from .link-validator-ignore.json
let ignoreConfig = { ignoreRules: [] };
const staleIgnoreRules = []; // Track stale ignore rules (from closed issues)

try {
  if (fs.existsSync(IGNORE_CONFIG_FILE)) {
    const configContent = fs.readFileSync(IGNORE_CONFIG_FILE, 'utf-8');
    ignoreConfig = JSON.parse(configContent);
  }
} catch (error) {
  console.warn(`⚠️  Warning: Failed to load ignore config: ${error.message}`);
}

/**
 * Check if a GitHub issue is closed (cached to avoid API rate limits)
 * @param {string} issueNumber - GitHub issue number
 * @returns {boolean} True if issue is closed, false if open or unable to determine
 */
const issueStatusCache = {};
function isGitHubIssueClosed(issueNumber) {
  if (!issueNumber) return false;
  
  // Check cache first
  if (issueStatusCache.hasOwnProperty(issueNumber)) {
    return issueStatusCache[issueNumber];
  }
  
  try {
    // Try to use gh CLI if available
    const output = execSync(
      `gh issue view ${issueNumber} --json state --jq '.state' 2>/dev/null || echo 'unknown'`,
      { cwd: ROOT_DIR, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();
    
    const isClosed = output === 'CLOSED';
    issueStatusCache[issueNumber] = isClosed;
    return isClosed;
  } catch (error) {
    // If gh CLI not available or error occurs, assume issue is open (don't warn)
    issueStatusCache[issueNumber] = false;
    return false;
  }
}

// Files that contain example/placeholder links (not actual navigation)
const EXAMPLE_FILES = [
  'GIT-RENAME-DETECTION-FEATURE.md',
  'LINK-VALIDATOR-AUTO-FIX-FEATURE.md'
];

// Patterns for example/placeholder links that should be ignored
const EXAMPLE_LINK_PATTERNS = [
  /^\.\.\/getting-started\.md$/,
  /^\.\.\/intro\/quickstart\.md$/,
  /^filepath(#anchor)?$/,
  /^path\/to\/file\.md$/,
  /^\.\/WORKFLOW-DIAGNOSTICS-GUIDE\.md$/,
  /^\.\/workflow-diagnostics-guide\.md$/,
  /^url$/
];

// Files in archived sections (lower priority warnings)
const ARCHIVED_PATTERNS = [
  /scripts\/archived\//,
  /tests\/_archive\//,
  /docs\/archived\//
];

// Technical spec files where src/ paths are code examples, not links
const TECHNICAL_SPEC_FILES = [
  'docs/reference/OPTION2-MULTI-DATABASE-IMPLEMENTATION.md',
  'docs/reference/architecture/MULTI-DATABASE-IMPLEMENTATION.md',
  'docs/reference/database/DATABASE-MIGRATION-FIXES.md',
  'docs/reference/database/DATABASE-OPTIMIZATION.md',
  'docs/reference/permissions/PERMISSION-MODEL.md',
  'docs/reference/permissions/ROLE-PERMISSION-SYSTEM-STATUS.md'
];

// Patterns for code example paths (not actual links)
const CODE_EXAMPLE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^\.\/?src\//,
  /^\/src\//,
  /^\/data\//,
  /^\/scripts\//,
  /^\/docs\//,
  /^\.\/?\.github\//,
  /^\.env$/
];

/**
 * Extract all markdown links from file content
 * @param {string} content - File content
 * @returns {Array} Array of links found
 */
function findMarkdownLinks(content) {
  const linkPattern = /\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  // Remove code blocks and inline code to avoid finding links in examples
  const cleanContent = content
    // Remove code blocks (``` ... ```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code (` ... `)
    .replace(/`[^`]+`/g, '');
  
  while ((match = linkPattern.exec(cleanContent)) !== null) {
    links.push(match[1]);
  }
  
  return links;
}

/**
 * Check if a link should be ignored based on ignore configuration
 * @param {string} link - Link to check
 * @param {string} sourceFile - Source file containing the link
 * @returns {Object|null} Ignore info with GitHub issue reference if should be ignored, null otherwise
 */
function checkIgnoreConfig(link, sourceFile) {
  const relPath = path.relative(ROOT_DIR, sourceFile);
  
  // Check each ignore rule
  for (const rule of ignoreConfig.ignoreRules || []) {
    let matches = false;
    
    // Check file pattern
    if (rule.file) {
      const filePattern = new RegExp(rule.file);
      if (!filePattern.test(relPath)) {
        continue;
      }
    }
    
    // Check link pattern
    if (rule.link) {
      const linkPattern = new RegExp(rule.link);
      if (!linkPattern.test(link)) {
        continue;
      }
    }
    
    // Check exact match
    if (rule.exactFile && rule.exactFile !== relPath) {
      continue;
    }
    
    if (rule.exactLink && rule.exactLink !== link) {
      continue;
    }
    
    // If we get here, the rule matches
    matches = true;
    
    if (matches) {
      // Check if the issue for this rule is closed
      const isClosed = rule.issue && isGitHubIssueClosed(rule.issue);
      
      // Track stale ignore rules (from closed issues)
      if (isClosed) {
        staleIgnoreRules.push({
          issue: rule.issue,
          file: relPath,
          link,
          reason: rule.reason || 'No reason provided'
        });
        // Don't ignore the link - let it be checked normally
        return null;
      }
      
      return {
        reason: 'config-ignore',
        category: `GitHub Issue #${rule.issue || 'Tracked'}`,
        issue: rule.issue,
        comment: rule.comment || 'Tracked in GitHub issue',
        status: 'open'
      };
    }
  }
  
  return null;
}

/**
 * Check if a link should be ignored based on patterns
 * @param {string} link - Link to check
 * @param {string} sourceFile - Source file containing the link
 * @returns {Object|null} Ignore info if should be ignored, null otherwise
 */
function shouldIgnoreLink(link, sourceFile) {
  const fileName = path.basename(sourceFile);
  const relPath = path.relative(ROOT_DIR, sourceFile);
  
  // First check the ignore configuration file
  const configIgnore = checkIgnoreConfig(link, sourceFile);
  if (configIgnore) {
    return configIgnore;
  }
  
  // Check if this is an example/placeholder link in feature documentation
  if (EXAMPLE_FILES.includes(fileName)) {
    for (const pattern of EXAMPLE_LINK_PATTERNS) {
      if (pattern.test(link)) {
        return { reason: 'example', category: 'Feature Documentation (Example Link)' };
      }
    }
  }
  
  // Check if this is a code example path in technical specs
  for (const specFile of TECHNICAL_SPEC_FILES) {
    if (relPath === specFile || relPath.endsWith(specFile)) {
      for (const pattern of CODE_EXAMPLE_PATTERNS) {
        if (pattern.test(link)) {
          return { reason: 'code-example', category: 'Technical Spec (Code Example)' };
        }
      }
    }
  }
  
  // Check if link is in archived documentation
  for (const pattern of ARCHIVED_PATTERNS) {
    if (pattern.test(relPath)) {
      // Only mark as info if it references Phase documents or deleted files
      if (link.includes('PHASE-') || link.includes('TEST-FILE-AUDIT')) {
        return { reason: 'archived', category: 'Archived Documentation (Historical Reference)' };
      }
    }
  }
  
  return null;
}

/**
 * Check if a link is broken
 * @param {string} link - Link to check
 * @param {string} baseDir - Base directory for resolving relative paths
 * @param {string} sourceFile - Source file containing the link
 * @returns {Object} Result with status and resolved path
 */
function checkLink(link, baseDir, sourceFile) {
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
  
  // Check if this link should be ignored
  const ignoreInfo = shouldIgnoreLink(link, sourceFile);
  if (ignoreInfo) {
    return {
      valid: true,
      type: 'ignored',
      link,
      ignoreReason: ignoreInfo.reason,
      category: ignoreInfo.category,
      issue: ignoreInfo.issue,
      comment: ignoreInfo.comment
    };
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
 * Detect if a file was renamed or moved in git history
 * @param {string} fileName - Original file name/path
 * @returns {string|null} New file path if renamed, null otherwise
 */
function detectRenamedFile(fileName) {
  try {
    // Get the latest rename/move for this file
    const output = execSync(
      `git log --all --follow --name-status --diff-filter=R -- "${fileName}" 2>/dev/null | head -3`,
      { cwd: ROOT_DIR, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();

    if (!output) return null;

    const lines = output.split('\n');
    for (const line of lines) {
      if (line.startsWith('R')) {
        const parts = line.split('\t');
        if (parts.length === 3 && parts[1] === fileName) {
          return parts[2];
        }
      }
    }
    return null;
  } catch (_e) { // eslint-disable-line no-unused-vars
    return null;
  }
}

/**
 * Get the latest rename/move for a file from git
 * @param {string} originalPath - Original file path
 * @returns {string|null} Current file path if renamed, null otherwise
 */
// eslint-disable-next-line no-unused-vars
function getLatestRename(originalPath) {
  try {
    // Use git follow to track through renames
    const output = execSync(
      `git log --all --follow --pretty=format:%H -- "${originalPath}" 2>/dev/null | head -1`,
      { cwd: ROOT_DIR, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();

    if (!output) return null;

    // Get the current name at the latest commit
    const currentOutput = execSync(
      `git ls-tree -r HEAD --name-only 2>/dev/null | grep -i "$(basename ${originalPath})"`,
      { cwd: ROOT_DIR, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();

    if (currentOutput) {
      const lines = currentOutput.split('\n');
      return lines[0] || null;
    }
    return null;
  } catch (_e) { // eslint-disable-line no-unused-vars
    return null;
  }
}

/**
 * Find a file by old name in git history
 * @param {string} fileName - File name to search for
 * @returns {Object|null} Object with oldPath and newPath, or null
 */
// eslint-disable-next-line no-unused-vars
function findMovedFileInGit(fileName) {
  try {
    const output = execSync(
      `git log --all --follow --name-status -- "${fileName}" 2>/dev/null`,
      { cwd: ROOT_DIR, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();

    if (!output) return null;

    const lines = output.split('\n');
    for (const line of lines) {
      if (line.startsWith('R')) {
        const parts = line.split('\t');
        if (parts.length === 3 && parts[1] === fileName) {
          return { oldPath: parts[1], newPath: parts[2] };
        }
      }
    }
    return null;
  } catch (_e) { // eslint-disable-line no-unused-vars
    return null;
  }
}

/**
 * Get full rename history for a file
 * @param {string} fileName - File name
 * @returns {Array} Array of rename operations
 */
function getGitRenameHistory(fileName) {
  try {
    const output = execSync(
      `git log --all --follow --name-status --diff-filter=R -- "${fileName}" 2>/dev/null`,
      { cwd: ROOT_DIR, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();

    if (!output) return [];

    const history = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.startsWith('R')) {
        const parts = line.split('\t');
        if (parts.length === 3) {
          history.push({ oldPath: parts[1], newPath: parts[2] });
        }
      }
    }

    return history;
  } catch (_e) { // eslint-disable-line no-unused-vars
    return [];
  }
}

/**
 * Validate if a link points to a moved/renamed file
 * @param {string} link - Link to check
 * @returns {Object|null} Object with isMoved, oldPath, newPath or null
 */
// eslint-disable-next-line no-unused-vars
function validateMovedFileLink(link) {
  const filePath = link.split('#')[0];

  try {
    const history = getGitRenameHistory(filePath);
    if (history.length > 0) {
      return {
        isMoved: true,
        oldPath: filePath,
        newPath: history[0].newPath
      };
    }
    return null;
  } catch (_e) { // eslint-disable-line no-unused-vars
    return null;
  }
}

/**
 * Fix a link pointing to a moved/renamed file
 * @param {string} mdFile - Markdown file to fix
 * @param {string} oldLink - Old link
 * @param {string} newLink - New link to replace with
 * @returns {boolean} True if fix was applied
 */
function fixLinkForMovedFile(mdFile, oldLink, newLink) {
  if (oldLink.startsWith('http') || oldLink.startsWith('mailto:')) {
    return false;
  }

  try {
    let content = fs.readFileSync(mdFile, 'utf-8');
    const originalContent = content;

    // Escape special regex characters in oldLink
    const escapedOldLink = oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(`\\]\\(${escapedOldLink}`, 'g');

    content = content.replace(regex, `](${newLink}`);

    if (content !== originalContent) {
      fs.writeFileSync(mdFile, content, 'utf-8');
      return true;
    }
    return false;
  } catch (_e) { // eslint-disable-line no-unused-vars
    return false;
  }
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
      } catch (_error) { // eslint-disable-line no-unused-vars
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
  } catch (_error) { // eslint-disable-line no-unused-vars
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
    // eslint-disable-next-line security/detect-non-literal-regexp
    const linkPattern = new RegExp(`\\]\\(${escapedLink}(?:(#[^)]+))?\\)`, 'g');
    
    content = content.replace(linkPattern, (match, anchor) => {
      return `](${newLink}${anchor || ''})`;
    });
    
    fs.writeFileSync(mdFile, content, 'utf-8');
  } catch (_error) { // eslint-disable-line no-unused-vars
    // Silently skip if file can't be written
  }
}

/**
 * Auto-fix links in a markdown file
 * Attempts to fix broken links by finding case-insensitive matches or git renames
 * @param {string} mdFile - Path to markdown file
 * @param {string} _baseDir - Base directory for resolving relative paths
 * @returns {Object} Summary of fixes
 */
function autoFixLinks(mdFile, _baseDir) {
  const results = {
    count: 0,
    fixes: [],
    renamedFiles: []
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
      
      // Try to find case-insensitive match first
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
            file: path.relative(ROOT_DIR, mdFile),
            reason: 'case-insensitive-match'
          });
        }
      } else if (DETECT_RENAMES) {
        // Try to find renamed file in git
        const renamedPath = detectRenamedFile(filePath);
        
        if (renamedPath) {
          // Calculate new relative path
          const newRelativePath = path.relative(fileDir, path.resolve(ROOT_DIR, renamedPath));
          const prefix = filePath.startsWith('./') ? './' : '';
          const newLink = prefix + newRelativePath.replace(/\\/g, '/');
          
          // Build new link with anchor if present
          const newLinkWithAnchor = anchor ? `${newLink}#${anchor}` : newLink;
          
          if (newLinkWithAnchor !== link) {
            fixLinkForMovedFile(mdFile, link, newLinkWithAnchor);
            results.count++;
            results.fixes.push({
              oldLink: link,
              newLink: newLinkWithAnchor,
              file: path.relative(ROOT_DIR, mdFile),
              reason: 'git-rename',
              renamedFrom: filePath,
              renamedTo: renamedPath
            });
            
            results.renamedFiles.push({
              oldPath: filePath,
              newPath: renamedPath
            });
          }
        }
      }
    }
  } catch (_error) { // eslint-disable-line no-unused-vars
    // Silently handle errors
  }
  
  return results;
}

/**  return results;
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
    ignored: 0,
    fixed: 0,
    byFile: {},
    ignoredByCategory: {}
  };
  
  const brokenLinks = {};
  const fixedLinks = [];
  const ignoredLinks = {};
  
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
        const checkResult = checkLink(link, fileDir, mdFile);
        
        if (checkResult.type === 'external') {
          results.external++;
        } else if (checkResult.type === 'ignored') {
          results.ignored++;
          // Track ignored links by category
          const category = checkResult.category || 'Other';
          if (!results.ignoredByCategory[category]) {
            results.ignoredByCategory[category] = 0;
          }
          results.ignoredByCategory[category]++;
          
          // Track ignored links by file
          if (!ignoredLinks[relPath]) {
            ignoredLinks[relPath] = [];
          }
          ignoredLinks[relPath].push({
            link: checkResult.link,
            reason: checkResult.ignoreReason,
            category: checkResult.category,
            issue: checkResult.issue,
            comment: checkResult.comment
          });
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
            const checkResult = checkLink(link, fileDir, mdFile);
            if (checkResult.type !== 'external' && checkResult.type !== 'ignored' && !checkResult.valid) {
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
  console.log(`Ignored links:           ${results.ignored}`);
  console.log(`Broken links:            ${results.broken}`);
  console.log(`Files with broken links: ${Object.keys(brokenLinks).length}`);
  
  if (ENABLE_FIX) {
    console.log(`Links fixed:             ${results.fixed}`);
  }
  console.log();
  
  // Print ignored links by category
  if (results.ignored > 0) {
    console.log('ℹ️  IGNORED LINKS BY CATEGORY\n');
    for (const [category, count] of Object.entries(results.ignoredByCategory)) {
      console.log(`   ${category}: ${count} links`);
    }
    console.log();
    
    // Print details of GitHub issue tracked links
    const issueTrackedLinks = [];
    for (const [file, links] of Object.entries(ignoredLinks)) {
      for (const linkInfo of links) {
        if (linkInfo.issue) {
          issueTrackedLinks.push({ file, ...linkInfo });
        }
      }
    }
    
    if (issueTrackedLinks.length > 0) {
      console.log('🔗 LINKS TRACKED IN GITHUB ISSUES\n');
      const byIssue = {};
      for (const tracked of issueTrackedLinks) {
        if (!byIssue[tracked.issue]) {
          byIssue[tracked.issue] = [];
        }
        byIssue[tracked.issue].push(tracked);
      }
      
      for (const [issue, links] of Object.entries(byIssue)) {
        console.log(`   Issue #${issue}: ${links.length} link(s)`);
        for (const link of links) {
          console.log(`      📄 ${link.file}`);
          console.log(`         ${link.link}`);
          if (link.comment) {
            console.log(`         💬 ${link.comment}`);
          }
        }
      }
      console.log();
    }
  }
  
  // Print fixed links if any
  if (fixedLinks.length > 0) {
    console.log('✅ LINKS FIXED\n');
    for (const fixedFile of fixedLinks) {
      console.log(`📄 ${fixedFile.file}`);
      for (const fix of fixedFile.fixes) {
        const reason = fix.reason === 'git-rename' 
          ? `🔄 git rename (${fix.renamedFrom} → ${fix.renamedTo})`
          : '📁 case-insensitive';
        console.log(`   ✓ ${fix.oldLink}`);
        console.log(`     → ${fix.newLink}`);
        console.log(`     [${reason}]`);
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
    // Check for stale ignore rules (from closed GitHub issues)
    if (staleIgnoreRules.length > 0) {
      console.log('⚠️  STALE IGNORE CONFIGURATION (From Closed GitHub Issues)\n');
      const uniqueIssues = [...new Set(staleIgnoreRules.map(r => r.issue))];
      
      for (const issue of uniqueIssues) {
        const rules = staleIgnoreRules.filter(r => r.issue === issue);
        console.log(`   Issue #${issue} (CLOSED) - ${rules.length} ignore rule(s):`);
        for (const rule of rules) {
          console.log(`      📄 ${rule.file}`);
          console.log(`         Link: ${rule.link}`);
          console.log(`         Reason: ${rule.reason}`);
        }
      }
      console.log();
      console.log('💡 Update or remove stale ignore rules from .link-validator-ignore.json\n');
    }
    
    console.log('✅ All links are valid!\n');
    return 0; // Success
  }
}

// Run validation
const exitCode = validateDocumentation();
process.exit(exitCode);
