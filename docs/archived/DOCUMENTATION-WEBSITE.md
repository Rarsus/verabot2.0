# Documentation Website

VeraBot2.0 has a dedicated documentation website that provides a comprehensive, user-friendly guide to all features, commands, and setup instructions.

## 🌐 Live Website

**URL:** [https://Rarsus.github.io/Verabot](https://Rarsus.github.io/Verabot)

## 📖 What's Included

The documentation website features:

- **Home** - Project overview, key features, and quick start
- **Installation** - Complete setup and configuration guide
- **Usage** - How to use all bot features and commands
- **API Documentation** - Comprehensive command reference with examples
- **Contributing** - Guidelines for contributing to the project
- **FAQ & Support** - Troubleshooting and common questions

## 🎨 Features

- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Dark Mode Support** - Automatic based on system preference
- ✅ **Live Search** - Quick navigation through table of contents
- ✅ **Code Highlighting** - Syntax-highlighted code examples
- ✅ **Dynamic Content** - Loads from markdown files in this repository
- ✅ **Easy Navigation** - Sidebar, breadcrumbs, and in-page TOC

## 🛠️ Local Development

To work on the documentation website locally:

1. Navigate to the website directory:

   ```bash
   cd website/
   ```

2. Start a local web server:

   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Or using Node.js
   npx http-server
   ```

3. Open your browser to `http://localhost:8000`

4. Make changes and refresh to see updates

See [website/README.md](../website/README.md) for detailed information about customization and development.

## 🚀 Deployment

The website is automatically deployed to GitHub Pages whenever changes are pushed to the `main` branch. The deployment is handled by GitHub Actions.

### Workflow

1. Developer pushes changes to `main` branch
2. GitHub Actions workflow `.github/workflows/deploy-docs.yml` triggers
3. Website files and docs are copied to build directory
4. Site is deployed to GitHub Pages
5. Available at `https://Rarsus.github.io/Verabot`

### Manual Deployment

To manually trigger deployment:

1. Go to the [Actions](https://github.com/Rarsus/verabot2.0/actions) tab
2. Select "Deploy Documentation Site" workflow
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow" button

## 📝 Contributing to Docs

To improve the documentation:

1. **Update Website Content:**
   - Edit files in `website/` directory
   - Modify custom page generators in `website/app.js`
   - Update styles in `website/styles.css`

2. **Update Documentation Files:**
   - Edit markdown files in `docs/` directory
   - Website dynamically loads from these files
   - Changes reflect automatically on next deployment

3. **Submit Changes:**
   - Create a feature branch
   - Make your changes
   - Test locally
   - Submit a pull request

## 🎯 Design System

The website uses a comprehensive design system with:

- **CSS Variables** - Over 100 customizable variables
- **Consistent Typography** - Defined font scales
- **Color Palette** - Primary, secondary, and semantic colors
- **Spacing System** - Uniform spacing units
- **Responsive Breakpoints** - Desktop, tablet, and mobile

All design tokens are defined in `website/styles.css` and can be easily customized.

## 📱 Browser Support

The documentation website supports:

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔗 Links

- **Live Site:** [https://Rarsus.github.io/Verabot](https://Rarsus.github.io/Verabot)
- **Source Code:** [website/](../website/)
- **Deployment Workflow:** [.github/workflows/deploy-docs.yml](../.github/workflows/deploy-docs.yml)
- **GitHub Repository:** [https://github.com/Rarsus/verabot2.0](https://github.com/Rarsus/verabot2.0)

## 💡 Tips

- The website uses CDN-hosted libraries (marked.js, highlight.js)
- No build process required - pure HTML/CSS/JS
- Base path is configured for `/Verabot` sub-site
- All pages are generated dynamically for easy maintenance

---

**Last Updated:** December 2025
