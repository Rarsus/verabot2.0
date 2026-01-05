# VeraBot2.0 Documentation Website

This directory contains the documentation website for VeraBot2.0, designed to be deployed as a sub-site under `Rarsus.github.io/Verabot`.

## 📁 Structure

```
website/
├── index.html       # Main HTML template
├── styles.css       # Comprehensive CSS stylesheet
├── app.js           # JavaScript application logic
└── README.md        # This file
```

## 🚀 Features

- **Single-page application** with client-side routing
- **Dynamic content loading** from markdown files in `docs/` folder
- **Responsive design** with mobile menu support
- **Dark mode support** (automatic based on system preference)
- **Syntax highlighting** for code blocks (highlight.js)
- **Markdown parsing** (marked.js)
- **Table of contents** auto-generated for each page
- **Extensive CSS** with CSS variables for easy customization

## 🎨 Customization

The website uses CSS variables (custom properties) for easy theming. Edit these in `styles.css`:

```css
:root {
  --color-primary: #5865f2;
  --color-bg-primary: #ffffff;
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  /* ... and many more */
}
```

## 📄 Pages

The website includes the following pages:

1. **Home** - Overview and key features
2. **Installation** - Setup and installation guide
3. **Usage** - How to use VeraBot2.0
4. **API Documentation** - Complete command reference
5. **Contributing** - Guide for contributors
6. **FAQ** - Frequently asked questions and troubleshooting

## 🔧 Local Development

To test the website locally:

1. Start a local web server in the repository root:

   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Or using Node.js
   npx http-server
   ```

2. Open your browser to `http://localhost:8000/website/`

3. Make changes and refresh to see updates

## 🌐 Deployment

The website is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

### Deployment Process

1. GitHub Actions workflow (`.github/workflows/deploy-docs.yml`) is triggered
2. Website files and docs are copied to `_site` directory
3. Site is built and uploaded as artifact
4. Deployed to GitHub Pages at `https://Rarsus.github.io/Verabot`

### Manual Deployment

To manually trigger deployment:

1. Go to GitHub Actions tab
2. Select "Deploy Documentation Site" workflow
3. Click "Run workflow"

## 🔗 Base Path Configuration

The website is configured to work as a sub-site under `/Verabot`. The base path is set in `app.js`:

```javascript
const CONFIG = {
  basePath: '/Verabot', // GitHub Pages sub-path
  docsPath: '../docs', // Relative path to docs folder
  defaultPage: 'home',
};
```

If deploying to a different path, update the `basePath` variable.

## 📱 Responsive Breakpoints

- **Desktop:** > 1200px - Full layout with sidebar and TOC
- **Tablet:** 992px - 1200px - Sidebar hidden, TOC visible
- **Mobile:** < 768px - Mobile menu, condensed layout

## 🎯 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Dependencies (CDN)

- **marked.js** - Markdown parsing
- **highlight.js** - Syntax highlighting

No build process required! All dependencies are loaded via CDN.

## 🛠️ Troubleshooting

### Pages not loading

- Check browser console for errors
- Verify paths in `app.js` are correct
- Ensure markdown files exist in `docs/` folder

### Styles not applying

- Clear browser cache
- Check CSS file is loading (Network tab)
- Verify CSS variable values

### Code highlighting not working

- Check highlight.js is loading from CDN
- Verify internet connection
- Use browser console to check for errors

## 🎨 Design System

The website uses a comprehensive design system with:

- **Color palette** - Primary, secondary, background, text colors
- **Typography scale** - Consistent font sizes and weights
- **Spacing scale** - Uniform spacing units
- **Component styles** - Reusable component patterns
- **Utility classes** - Helper classes for common styles

All design tokens are defined as CSS variables for consistency.

## 📝 Adding New Pages

To add a new page:

1. Add entry to `PAGE_CONTENT` object in `app.js`:

   ```javascript
   mypage: {
       title: 'My Page',
       source: 'custom',
       content: generateMyPageContent
   }
   ```

2. Create content generator function:

   ```javascript
   function generateMyPageContent() {
     return `<h1>My Page</h1><p>Content here</p>`;
   }
   ```

3. Add navigation link in `index.html`:
   ```html
   <li><a href="#mypage" data-page="mypage" class="nav-link">My Page</a></li>
   ```

## 🔐 Security

- No server-side code execution
- Static HTML/CSS/JS only
- External resources loaded via HTTPS
- No user data collection

## 📄 License

Same as VeraBot2.0 project - MIT License

## 🤝 Contributing

To contribute to the documentation website:

1. Make changes to files in `website/` directory
2. Test locally using a web server
3. Submit pull request with clear description
4. Wait for review and deployment

---

**Last Updated:** December 2025
