// ========================================
// Configuration
// ========================================
const CONFIG = {
    basePath: '/Verabot',  // GitHub Pages sub-path
    docsPath: '../docs',    // Relative path to docs folder
    docsBaseURL: 'https://raw.githubusercontent.com/Rarsus/verabot2.0/main/files/docs/',
    readmeURL: 'https://raw.githubusercontent.com/Rarsus/verabot2.0/main/README.md',
    defaultPage: 'home'
};

// Page content mapping - maps page IDs to content sources
const PAGE_CONTENT = {
    home: {
        title: 'Home',
        source: 'custom',
        content: generateHomeContent
    },
    installation: {
        title: 'Installation',
        source: 'markdown',
        file: CONFIG.readmeURL,
        section: 'installation'
    },
    usage: {
        title: 'Usage',
        source: 'markdown',
        file: CONFIG.readmeURL,
        section: 'usage'
    },
    api: {
        title: 'API Documentation',
        source: 'markdown',
        file: CONFIG.docsBaseURL + 'api.md'
    },
    contributing: {
        title: 'Contributing',
        source: 'markdown',
        file: CONFIG.docsBaseURL + 'contributing.md'
    },
    faq: {
        title: 'FAQ & Support',
        source: 'markdown',
        file: CONFIG.docsBaseURL + 'faq.md'
    }
};

// ========================================
// State Management
// ========================================
const state = {
    currentPage: CONFIG.defaultPage,
    sidebarOpen: false,
    mobileMenuOpen: false
};

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeRouter();
    initializeNavigation();
    initializeMobileMenu();
    loadInitialPage();
});

// ========================================
// Router
// ========================================
function initializeRouter() {
    // Handle initial hash
    const hash = window.location.hash.slice(1) || CONFIG.defaultPage;
    navigateToPage(hash);
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const page = window.location.hash.slice(1) || CONFIG.defaultPage;
        navigateToPage(page);
    });
}

function navigateToPage(pageId) {
    if (!PAGE_CONTENT[pageId]) {
        pageId = CONFIG.defaultPage;
    }
    
    state.currentPage = pageId;
    loadPage(pageId);
    updateActiveNav(pageId);
    updateBreadcrumb(pageId);
}

// ========================================
// Navigation
// ========================================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const page = link.dataset.page;
            if (page) {
                e.preventDefault();
                window.location.hash = page;
                closeMobileMenu();
            }
        });
    });
}

function updateActiveNav(pageId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateBreadcrumb(pageId) {
    const breadcrumb = document.getElementById('breadcrumb');
    const pageInfo = PAGE_CONTENT[pageId];
    breadcrumb.innerHTML = `<span>Home</span><span>${pageInfo.title}</span>`;
}

// ========================================
// Mobile Menu
// ========================================
function initializeMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (toggle) {
        toggle.addEventListener('click', () => {
            state.mobileMenuOpen = !state.mobileMenuOpen;
            navList.classList.toggle('open', state.mobileMenuOpen);
        });
    }
}

function closeMobileMenu() {
    const navList = document.querySelector('.nav-list');
    state.mobileMenuOpen = false;
    navList.classList.remove('open');
}

// ========================================
// Page Loading
// ========================================
function loadInitialPage() {
    const hash = window.location.hash.slice(1) || CONFIG.defaultPage;
    navigateToPage(hash);
}

async function loadPage(pageId) {
    const contentEl = document.getElementById('content');
    const pageInfo = PAGE_CONTENT[pageId];
    
    // Show loading
    contentEl.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        let html = '';
        
        if (pageInfo.source === 'custom') {
            html = pageInfo.content();
        } else if (pageInfo.source === 'markdown') {
            html = await loadMarkdownFile(pageInfo.file, pageInfo.section);
        }
        
        contentEl.innerHTML = html;
        contentEl.classList.add('fade-in');
        
        // Highlight code blocks
        highlightCodeBlocks();
        
        // Generate table of contents
        generateTableOfContents();
        
        // Scroll to top
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Error loading page:', error);
        contentEl.innerHTML = `
            <div class="error">
                <h2>⚠️ Error Loading Content</h2>
                <p>Sorry, we couldn't load this page. Please try again later.</p>
                <p class="text-muted">${error.message}</p>
            </div>
        `;
    }
}

async function loadMarkdownFile(filePath, section) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}`);
        }
        
        const markdown = await response.text();
        let content = markdown;
        
        // Extract specific section if needed
        if (section) {
            content = extractSection(markdown, section);
        }
        
        // Convert markdown to HTML
        const html = marked.parse(content);
        return html;
        
    } catch (error) {
        console.error('Error loading markdown:', error);
        throw error;
    }
}

function extractSection(markdown, sectionName) {
    // Simple section extraction - finds heading and content until next same-level heading
    const lines = markdown.split('\n');
    const sectionRegex = new RegExp(`^##\\s+.*${sectionName}`, 'i');
    
    let inSection = false;
    let sectionContent = [];
    let sectionLevel = 0;
    
    for (const line of lines) {
        if (inSection) {
            // Check if we hit another section of same or higher level
            const headingMatch = line.match(/^(#{1,6})\s/);
            if (headingMatch && headingMatch[1].length <= sectionLevel) {
                break;
            }
            sectionContent.push(line);
        } else if (sectionRegex.test(line)) {
            inSection = true;
            const match = line.match(/^(#{1,6})\s/);
            sectionLevel = match ? match[1].length : 2;
            sectionContent.push(line);
        }
    }
    
    return sectionContent.length > 0 ? sectionContent.join('\n') : markdown;
}

// ========================================
// Table of Contents Generation
// ========================================
// Safely escape text for inclusion in HTML.
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function generateTableOfContents() {
    const content = document.getElementById('content');
    const tocNav = document.getElementById('tocNav');
    const headings = content.querySelectorAll('h2, h3, h4');
    
    if (headings.length === 0) {
        tocNav.innerHTML = '<p class="text-muted">No sections</p>';
        return;
    }
    
    const tocItems = Array.from(headings).map(heading => {
        const id = heading.id || generateId(heading.textContent);
        heading.id = id;
        
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent;
        
        return `<a href="#${id}" class="toc-level-${level}">${escapeHtml(text)}</a>`;
    });
    
    tocNav.innerHTML = tocItems.join('');
    
    // Add click handlers
    tocNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function generateId(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ========================================
// Code Highlighting
// ========================================
function highlightCodeBlocks() {
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }
}

// ========================================
// Custom Page Content Generators
// ========================================
function generateHomeContent() {
    return `
        <div class="home-hero">
            <h1>🤖 Welcome to VeraBot2.0 Documentation</h1>
            <p class="text-lg">Advanced Discord bot with organized commands, quote management system, and modern architecture.</p>
        </div>
        
        <div class="feature-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin: 3rem 0;">
            <div class="feature-card" style="padding: 1.5rem; border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md);">
                <h3>⚡ Quick Start</h3>
                <p>Get up and running in minutes with our comprehensive installation guide.</p>
                <a href="#installation" class="btn">Get Started →</a>
            </div>
            
            <div class="feature-card" style="padding: 1.5rem; border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md);">
                <h3>📚 Usage Guide</h3>
                <p>Learn how to use all the features and commands available in VeraBot2.0.</p>
                <a href="#usage" class="btn">Learn More →</a>
            </div>
            
            <div class="feature-card" style="padding: 1.5rem; border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md);">
                <h3>🔧 API Reference</h3>
                <p>Complete API documentation for all commands and integrations.</p>
                <a href="#api" class="btn">View API →</a>
            </div>
            
            <div class="feature-card" style="padding: 1.5rem; border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md);">
                <h3>🤝 Contributing</h3>
                <p>Join our community and help improve VeraBot2.0.</p>
                <a href="#contributing" class="btn">Contribute →</a>
            </div>
        </div>
        
        <h2>✨ Key Features</h2>
        <ul>
            <li><strong>Discord Slash Commands</strong> - Modern slash command interface with autocomplete</li>
            <li><strong>Legacy Prefix Support</strong> - Backward compatible with prefix commands</li>
            <li><strong>Quote Management</strong> - Comprehensive quote system with search, tags, and ratings</li>
            <li><strong>AI-Powered Poetry</strong> - Generate poems using HuggingFace AI</li>
            <li><strong>SQLite Database</strong> - Persistent data storage with automatic schema management</li>
            <li><strong>100% Test Coverage</strong> - 74 comprehensive tests ensuring reliability</li>
            <li><strong>Modern Architecture</strong> - Clean, maintainable code with design patterns</li>
        </ul>
        
        <h2>🚀 Technology Stack</h2>
        <ul>
            <li><strong>Runtime:</strong> Node.js 18+</li>
            <li><strong>Framework:</strong> Discord.js v14.11.0</li>
            <li><strong>Database:</strong> SQLite3 v5.1.7</li>
            <li><strong>Testing:</strong> Custom test framework with 74 passing tests</li>
            <li><strong>AI Integration:</strong> HuggingFace API (optional)</li>
        </ul>
        
        <h2>📊 Project Highlights</h2>
        <ul>
            <li>✅ <strong>Production Ready</strong> - v2.0.0 stable release</li>
            <li>✅ <strong>Zero Vulnerabilities</strong> - Secure and maintained</li>
            <li>✅ <strong>Complete Documentation</strong> - Comprehensive guides and API docs</li>
            <li>✅ <strong>Docker Support</strong> - Easy deployment with containerization</li>
            <li>✅ <strong>CI/CD Ready</strong> - GitHub Actions workflows included</li>
        </ul>
        
        <div class="cta-section" style="margin: 3rem 0; padding: 2rem; background: var(--color-bg-secondary); border-radius: var(--border-radius-md); text-align: center;">
            <h2>Ready to Get Started?</h2>
            <p>Follow our installation guide to set up VeraBot2.0 in your Discord server.</p>
            <a href="#installation" class="btn" style="display: inline-block; padding: 0.75rem 1.5rem; background: var(--color-primary); color: white; border-radius: var(--border-radius-sm); margin-top: 1rem;">Install Now →</a>
        </div>
    `;
}

function generateAPIContent() {
    return `
        <h1>📖 API Documentation</h1>
        <p>Complete reference for all commands and APIs available in VeraBot2.0.</p>
        
        <h2>Command Categories</h2>
        
        <h3>🎯 Quote Management</h3>
        <ul>
            <li><strong>/add-quote</strong> - Add a new quote to the database</li>
            <li><strong>/quote</strong> - Retrieve a specific quote by ID</li>
            <li><strong>/list-quotes</strong> - Get all quotes (sent via DM)</li>
            <li><strong>/delete-quote</strong> - Delete a quote (admin only)</li>
            <li><strong>/update-quote</strong> - Update an existing quote (admin only)</li>
        </ul>
        
        <h3>🔍 Quote Discovery</h3>
        <ul>
            <li><strong>/random-quote</strong> - Get a random quote from the database</li>
            <li><strong>/search-quotes</strong> - Search quotes by text or author</li>
            <li><strong>/quote-stats</strong> - Display quote statistics</li>
        </ul>
        
        <h3>⭐ Quote Social Features</h3>
        <ul>
            <li><strong>/rate-quote</strong> - Rate a quote from 1-5 stars</li>
            <li><strong>/tag-quote</strong> - Tag quotes with categories</li>
        </ul>
        
        <h3>📤 Quote Export</h3>
        <ul>
            <li><strong>/export-quotes</strong> - Export quotes as JSON or CSV</li>
        </ul>
        
        <h3>🎮 Miscellaneous Commands</h3>
        <ul>
            <li><strong>/hi</strong> - Simple greeting command</li>
            <li><strong>/ping</strong> - Check bot latency</li>
            <li><strong>/help</strong> - Display paginated help information</li>
            <li><strong>/poem</strong> - Generate AI-powered poetry (requires HuggingFace API)</li>
        </ul>
        
        <h2>Command Usage Examples</h2>
        
        <h3>Adding a Quote</h3>
        <pre><code class="language-bash">/add-quote quote:"The only way to do great work is to love what you do" author:"Steve Jobs"</code></pre>
        
        <h3>Searching Quotes</h3>
        <pre><code class="language-bash">/search-quotes query:"inspiration"</code></pre>
        
        <h3>Rating a Quote</h3>
        <pre><code class="language-bash">/rate-quote id:5 rating:5</code></pre>
        
        <h3>Generating a Poem</h3>
        <pre><code class="language-bash">/poem type:"haiku" subject:"coffee"</code></pre>
        
        <h2>Database Schema</h2>
        <p>VeraBot2.0 uses SQLite with the following schema:</p>
        
        <h3>quotes Table</h3>
        <pre><code class="language-sql">CREATE TABLE quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    rating REAL DEFAULT 0
);</code></pre>
        
        <h3>ratings Table</h3>
        <pre><code class="language-sql">CREATE TABLE ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
);</code></pre>
        
        <h3>tags Table</h3>
        <pre><code class="language-sql">CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);</code></pre>
        
        <h3>quote_tags Table</h3>
        <pre><code class="language-sql">CREATE TABLE quote_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (quote_id) REFERENCES quotes(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);</code></pre>
        
        <h2>Architecture & Design Patterns</h2>
        
        <h3>Command Base Class</h3>
        <p>All commands extend the <code>Command</code> base class for automatic error handling:</p>
        <pre><code class="language-javascript">const Command = require('../../core/CommandBase');

class MyCommand extends Command {
  constructor() {
    super({ name: 'mycommand', description: 'Description', data, options });
  }

  async execute(message, args) {
    // Legacy prefix command handler
  }

  async executeInteraction(interaction) {
    // Slash command handler
  }
}

module.exports = new MyCommand().register();</code></pre>
        
        <h3>Response Helpers</h3>
        <p>Standardized Discord response functions:</p>
        <pre><code class="language-javascript">const { 
  sendQuoteEmbed,
  sendSuccess,
  sendError,
  sendDM 
} = require('../../utils/helpers/response-helpers');

await sendSuccess(interaction, 'Operation successful!');
await sendError(interaction, 'Something went wrong', true);</code></pre>
        
        <h2>Performance Metrics</h2>
        <ul>
            <li>Bot startup time: &lt; 3 seconds</li>
            <li>Command registration: &lt; 1 second per command</li>
            <li>Average command response: &lt; 200ms</li>
            <li>Database queries: &lt; 100ms typical</li>
        </ul>
    `;
}

function generateContributingContent() {
    return `
        <h1>🤝 Contributing to VeraBot2.0</h1>
        <p>Thank you for your interest in contributing to VeraBot2.0! This guide will help you get started.</p>
        
        <h2>Getting Started</h2>
        
        <h3>Prerequisites</h3>
        <ul>
            <li>Node.js 18 or higher</li>
            <li>Git</li>
            <li>A Discord account and bot token</li>
            <li>Basic knowledge of JavaScript and Discord.js</li>
        </ul>
        
        <h3>Setting Up Your Development Environment</h3>
        <ol>
            <li>Fork the repository on GitHub</li>
            <li>Clone your fork locally:
                <pre><code class="language-bash">git clone https://github.com/YOUR-USERNAME/verabot2.0.git
cd verabot2.0</code></pre>
            </li>
            <li>Install dependencies:
                <pre><code class="language-bash">npm install</code></pre>
            </li>
            <li>Copy <code>.env.example</code> to <code>.env</code> and configure your bot token</li>
            <li>Register commands:
                <pre><code class="language-bash">npm run register-commands</code></pre>
            </li>
        </ol>
        
        <h2>Development Workflow</h2>
        
        <h3>1. Create a Branch</h3>
        <pre><code class="language-bash">git checkout -b feature/your-feature-name</code></pre>
        
        <h3>2. Make Your Changes</h3>
        <p>Follow the existing code style and patterns:</p>
        <ul>
            <li>Use the Command base class for all commands</li>
            <li>Use response helpers for Discord messages</li>
            <li>Follow the existing file structure</li>
            <li>Add tests for new functionality</li>
        </ul>
        
        <h3>3. Test Your Changes</h3>
        <pre><code class="language-bash">npm run lint        # Check code style
npm test           # Run tests
npm start          # Test the bot locally</code></pre>
        
        <h3>4. Commit Your Changes</h3>
        <pre><code class="language-bash">git add .
git commit -m "feat: add new feature"</code></pre>
        
        <p>Use conventional commit messages:</p>
        <ul>
            <li><code>feat:</code> New feature</li>
            <li><code>fix:</code> Bug fix</li>
            <li><code>docs:</code> Documentation changes</li>
            <li><code>style:</code> Code style changes</li>
            <li><code>refactor:</code> Code refactoring</li>
            <li><code>test:</code> Test changes</li>
            <li><code>chore:</code> Build/tooling changes</li>
        </ul>
        
        <h3>5. Push and Create Pull Request</h3>
        <pre><code class="language-bash">git push origin feature/your-feature-name</code></pre>
        <p>Then create a pull request on GitHub.</p>
        
        <h2>Code Style Guidelines</h2>
        
        <h3>JavaScript Style</h3>
        <ul>
            <li>Use camelCase for variables and functions</li>
            <li>Use PascalCase for classes</li>
            <li>Use UPPER_SNAKE_CASE for constants</li>
            <li>Always use semicolons</li>
            <li>Use async/await instead of promises</li>
            <li>No console.log in production code (use proper logging)</li>
        </ul>
        
        <h3>Command Structure</h3>
        <p>Always use the Command base class pattern:</p>
        <pre><code class="language-javascript">const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');

const { data, options } = buildCommandOptions('commandname', 'Description', [
  { name: 'arg', type: 'string', required: true }
]);

class CommandName extends Command {
  constructor() {
    super({ name: 'commandname', description: 'Description', data, options });
  }

  async execute(message, args) {
    // Legacy command handler
  }

  async executeInteraction(interaction) {
    // Slash command handler
  }
}

module.exports = new CommandName().register();</code></pre>
        
        <h2>Testing</h2>
        <p>All new features should include tests:</p>
        <ul>
            <li>Add unit tests in <code>tests/unit/</code></li>
            <li>Add integration tests in <code>tests/integration/</code></li>
            <li>Ensure all tests pass before submitting PR</li>
            <li>Aim for high test coverage</li>
        </ul>
        
        <h2>Documentation</h2>
        <p>Update documentation when adding features:</p>
        <ul>
            <li>Update README.md with new commands</li>
            <li>Add guides in <code>docs/guides/</code> for complex features</li>
            <li>Update API documentation</li>
            <li>Include code examples</li>
        </ul>
        
        <h2>Pull Request Process</h2>
        <ol>
            <li>Ensure all tests pass</li>
            <li>Update documentation</li>
            <li>Fill out the PR template</li>
            <li>Request review from maintainers</li>
            <li>Address review feedback</li>
            <li>Wait for approval and merge</li>
        </ol>
        
        <h2>Community Guidelines</h2>
        <ul>
            <li>Be respectful and inclusive</li>
            <li>Help others when possible</li>
            <li>Follow the code of conduct</li>
            <li>Keep discussions on-topic</li>
            <li>Provide constructive feedback</li>
        </ul>
        
        <h2>Getting Help</h2>
        <p>If you need help with your contribution:</p>
        <ul>
            <li>Check the <a href="#faq">FAQ</a></li>
            <li>Review existing issues on GitHub</li>
            <li>Ask questions in your PR</li>
            <li>Join our community discussions</li>
        </ul>
        
        <h2>Recognition</h2>
        <p>All contributors are recognized in our README and release notes. Thank you for helping make VeraBot2.0 better!</p>
    `;
}

function generateFAQContent() {
    return `
        <h1>❓ FAQ & Support</h1>
        <p>Frequently asked questions and troubleshooting guide for VeraBot2.0.</p>
        
        <h2>Installation & Setup</h2>
        
        <h3>Q: What version of Node.js do I need?</h3>
        <p>A: VeraBot2.0 requires Node.js 18 or higher. We recommend using the latest LTS version.</p>
        
        <h3>Q: How do I get a Discord bot token?</h3>
        <p>A: Follow these steps:</p>
        <ol>
            <li>Go to <a href="https://discord.com/developers/applications" target="_blank">Discord Developer Portal</a></li>
            <li>Click "New Application" and give it a name</li>
            <li>Go to the "Bot" section</li>
            <li>Click "Reset Token" to generate a new token</li>
            <li>Copy the token and add it to your <code>.env</code> file</li>
        </ol>
        
        <h3>Q: Commands aren't showing up in Discord. What should I do?</h3>
        <p>A: Try these solutions:</p>
        <ol>
            <li>Make sure you ran <code>npm run register-commands</code></li>
            <li>Wait a few minutes - Discord can take time to sync commands</li>
            <li>If using a test guild, ensure <code>GUILD_ID</code> is set in <code>.env</code></li>
            <li>Restart your Discord client</li>
            <li>Check bot permissions in your server</li>
        </ol>
        
        <h3>Q: How do I set up AI poem generation?</h3>
        <p>A: You need a HuggingFace API key:</p>
        <ol>
            <li>Create an account at <a href="https://huggingface.co/" target="_blank">HuggingFace</a></li>
            <li>Generate an API token in your settings</li>
            <li>Add <code>HUGGINGFACE_API_KEY=your_key</code> to <code>.env</code></li>
            <li>Restart the bot</li>
        </ol>
        
        <h2>Usage & Commands</h2>
        
        <h3>Q: What's the difference between slash commands and prefix commands?</h3>
        <p>A: Both do the same thing, but:</p>
        <ul>
            <li><strong>Slash commands</strong> (<code>/command</code>) - Modern Discord interface with autocomplete and validation</li>
            <li><strong>Prefix commands</strong> (<code>!command</code>) - Traditional command style for backward compatibility</li>
        </ul>
        <p>We recommend using slash commands for the best experience.</p>
        
        <h3>Q: How do I export all quotes?</h3>
        <p>A: Use the export command:</p>
        <pre><code class="language-bash">/export-quotes format:json</code></pre>
        <p>Or for CSV:</p>
        <pre><code class="language-bash">/export-quotes format:csv</code></pre>
        
        <h3>Q: Can I delete or edit quotes?</h3>
        <p>A: Yes, but only administrators can:</p>
        <ul>
            <li><code>/delete-quote id:5</code> - Delete a quote</li>
            <li><code>/update-quote id:5 text:"New text"</code> - Update a quote</li>
        </ul>
        
        <h3>Q: How does the rating system work?</h3>
        <p>A: Users can rate quotes 1-5 stars:</p>
        <pre><code class="language-bash">/rate-quote id:5 rating:5</code></pre>
        <p>Ratings are averaged and stored in the database. Each user can rate a quote once.</p>
        
        <h2>Troubleshooting</h2>
        
        <h3>Q: The bot isn't responding to commands</h3>
        <p>A: Check these common issues:</p>
        <ol>
            <li>Is the bot online? Check Discord status indicator</li>
            <li>Does the bot have proper permissions?</li>
            <li>Check the bot logs for errors</li>
            <li>Verify your <code>.env</code> configuration</li>
            <li>Make sure commands are registered</li>
        </ol>
        
        <h3>Q: I'm getting a "Cannot find module" error</h3>
        <p>A: This usually means:</p>
        <ol>
            <li>Dependencies aren't installed - run <code>npm install</code></li>
            <li>A file path is incorrect</li>
            <li>You're in the wrong directory</li>
        </ol>
        
        <h3>Q: Database errors when adding quotes</h3>
        <p>A: Try these solutions:</p>
        <ol>
            <li>Check if <code>data/</code> directory exists</li>
            <li>Verify write permissions</li>
            <li>Delete <code>data/quotes.db</code> and restart (WARNING: loses data)</li>
            <li>Check logs for specific error messages</li>
        </ol>
        
        <h3>Q: Tests are failing</h3>
        <p>A: Common test issues:</p>
        <ol>
            <li>Run <code>npm install</code> to ensure all dependencies are installed</li>
            <li>Check that test database isn't corrupted</li>
            <li>Review test output for specific failures</li>
            <li>Try running individual test suites</li>
        </ol>
        
        <h2>Development</h2>
        
        <h3>Q: How do I create a new command?</h3>
        <p>A: Follow the guide in our documentation:</p>
        <ol>
            <li>Choose the appropriate category folder</li>
            <li>Use the Command base class template</li>
            <li>Implement execute methods</li>
            <li>Register the command</li>
            <li>Add tests</li>
        </ol>
        <p>See the <a href="#api">API Documentation</a> for detailed examples.</p>
        
        <h3>Q: How do I run tests?</h3>
        <p>A: Use these npm scripts:</p>
        <pre><code class="language-bash">npm test              # Quick sanity checks
npm run test:all      # All 74 tests
npm run test:quotes   # Quote system tests</code></pre>
        
        <h3>Q: What's the best way to contribute?</h3>
        <p>A: Check our <a href="#contributing">Contributing Guide</a> for detailed instructions. Quick steps:</p>
        <ol>
            <li>Fork the repository</li>
            <li>Create a feature branch</li>
            <li>Make your changes with tests</li>
            <li>Submit a pull request</li>
        </ol>
        
        <h2>Deployment</h2>
        
        <h3>Q: Can I deploy VeraBot2.0 with Docker?</h3>
        <p>A: Yes! Use the included Docker setup:</p>
        <pre><code class="language-bash">docker build -t verabot2 .
docker-compose up -d</code></pre>
        
        <h3>Q: How do I keep the bot running 24/7?</h3>
        <p>A: Several options:</p>
        <ul>
            <li>Use Docker with restart policies</li>
            <li>Use a process manager like PM2</li>
            <li>Deploy to a cloud platform (Heroku, Railway, etc.)</li>
            <li>Use a VPS with systemd service</li>
        </ul>
        
        <h3>Q: What are the system requirements?</h3>
        <p>A: Minimal requirements:</p>
        <ul>
            <li><strong>RAM:</strong> 256MB minimum (512MB recommended)</li>
            <li><strong>CPU:</strong> 1 core minimum</li>
            <li><strong>Storage:</strong> 100MB (plus space for database growth)</li>
            <li><strong>Network:</strong> Stable internet connection</li>
        </ul>
        
        <h2>Support</h2>
        
        <h3>Q: Where can I get help?</h3>
        <p>A: Multiple support channels:</p>
        <ul>
            <li><strong>GitHub Issues:</strong> <a href="https://github.com/Rarsus/verabot2.0/issues" target="_blank">Report bugs or request features</a></li>
            <li><strong>Documentation:</strong> Browse our comprehensive docs</li>
            <li><strong>Community:</strong> Join discussions on GitHub</li>
        </ul>
        
        <h3>Q: How do I report a bug?</h3>
        <p>A: Create a GitHub issue with:</p>
        <ol>
            <li>Clear description of the problem</li>
            <li>Steps to reproduce</li>
            <li>Expected vs actual behavior</li>
            <li>Error messages and logs</li>
            <li>Your environment (OS, Node version, etc.)</li>
        </ol>
        
        <h3>Q: How do I request a feature?</h3>
        <p>A: Open a GitHub issue with:</p>
        <ol>
            <li>Clear feature description</li>
            <li>Use case and benefits</li>
            <li>Proposed implementation (optional)</li>
            <li>Examples from similar projects (optional)</li>
        </ol>
        
        <h2>Licensing & Legal</h2>
        
        <h3>Q: What license is VeraBot2.0 under?</h3>
        <p>A: MIT License - you're free to use, modify, and distribute.</p>
        
        <h3>Q: Can I use this for commercial purposes?</h3>
        <p>A: Yes! The MIT License allows commercial use.</p>
        
        <h3>Q: Do I need to credit VeraBot2.0?</h3>
        <p>A: Not required, but appreciated! The MIT License only requires including the license text.</p>
        
        <h2>Still Have Questions?</h2>
        <p>If your question isn't answered here:</p>
        <ul>
            <li>Check our <a href="https://github.com/Rarsus/verabot2.0" target="_blank">GitHub repository</a></li>
            <li>Browse existing <a href="https://github.com/Rarsus/verabot2.0/issues" target="_blank">GitHub issues</a></li>
            <li>Create a new issue with your question</li>
        </ul>
    `;
}
