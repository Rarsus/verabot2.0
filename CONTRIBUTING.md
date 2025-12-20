# Contributing to VeraBot 2.0

Thank you for considering contributing to VeraBot 2.0! Contributions include reporting bugs, suggesting features, or submitting pull requests. This document outlines how you can effectively contribute to the project.

## Code of Conduct

Everyone participating in this project must abide by our [Code of Conduct](https://github.com/Rarsus/verabot2.0/blob/main/CODE_OF_CONDUCT.md). It explains acceptable behavior for community members and the consequences of unacceptable behavior.

## How Can You Contribute?

### Bug Reports
To report bugs, please open an issue in the [GitHub issues tracker](https://github.com/Rarsus/verabot2.0/issues) and include:
- A clear and descriptive title
- Steps to reproduce the issue
- Your environment (Node.js version, OS, etc.)
- Any relevant logs or screenshots

### Feature Requests
To request new features:
- Open an issue tagged as "enhancement"
- Clearly describe the proposed functionality
- Include any additional considerations or use cases

### Pull Requests
1. Fork the repository and create your branch:
   ```bash
   git checkout -b feature/your-branch-name
   ```
2. Make your changes and ensure code quality by running tests:
   ```bash
   npm test
   ```
3. Document your changes in `CHANGELOG.md` (if applicable).
4. Open a pull request detailing the changes you have made.

### Guidelines
- Write descriptive commit messages.
- Follow the existing code style. Run `npm run lint` to check for formatting issues.
- Ensure your changes don't break existing functionality.

### Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Rarsus/verabot2.0.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the bot locally (development mode):
   ```bash
   npm run dev
   ```

Thank you for improving VeraBot 2.0!