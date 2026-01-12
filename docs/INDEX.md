# VeraBot2.0 Documentation Index

Complete navigation for all VeraBot2.0 documentation. Choose your path below.

**📌 Note:** Archived documentation from completed phases and features is available in [docs/archive/](archive/INDEX.md).

---

## 🚀 Quick Start

**New to VeraBot2.0?**

1. Start: [Getting Started Guide](user-guides/01-CREATING-COMMANDS.md)
2. Learn: [Architecture Overview](architecture/ARCHITECTURE-OVERVIEW.md)
3. Build: [Create Your First Command](user-guides/01-CREATING-COMMANDS.md#creating-your-first-command)

**Deploy or Configure?**

1. Docker: [Docker Setup Guide](user-guides/DOCKER-SETUP.md)
2. Reminders: [Reminder System Guide](user-guides/05-REMINDER-SYSTEM.md)
3. Proxy: [Proxy Setup Guide](user-guides/04-PROXY-SETUP.md)

---

## 📚 Documentation by Category

### 👥 User Guides (How-To)

Step-by-step guides for common tasks:

| Guide                                                                              | Topic                       | Time   |
| ---------------------------------------------------------------------------------- | --------------------------- | ------ |
| [01-CREATING-COMMANDS.md](user-guides/01-CREATING-COMMANDS.md)                     | Create new commands         | 15 min |
| [02-TESTING-GUIDE.md](user-guides/02-TESTING-GUIDE.md)                             | Write tests (TDD)           | 20 min |
| [03-HUGGINGFACE-SETUP.md](user-guides/03-HUGGINGFACE-SETUP.md)                     | Enable AI poem generation   | 10 min |
| [04-PROXY-SETUP.md](user-guides/04-PROXY-SETUP.md)                                 | Configure webhook proxy     | 15 min |
| [05-REMINDER-SYSTEM.md](user-guides/05-REMINDER-SYSTEM.md)                         | Use reminder system         | 10 min |
| [DOCKER-SETUP.md](user-guides/DOCKER-SETUP.md)                                     | Run with Docker             | 10 min |
| [DOCKER-WORKFLOW.md](user-guides/DOCKER-WORKFLOW.md)                               | Docker development workflow | 10 min |
| [OPT-IN-SYSTEM.md](user-guides/OPT-IN-SYSTEM.md)                                   | User opt-in communication   | 10 min |
| [RESOLUTION-HELPERS-GUIDE.md](user-guides/RESOLUTION-HELPERS-GUIDE.md)             | Use response helpers        | 10 min |
| [SLASH-COMMANDS-TROUBLESHOOTING.md](user-guides/SLASH-COMMANDS-TROUBLESHOOTING.md) | Fix slash command issues    | 20 min |

---

### 👨‍💼 Admin Guides

For server administrators and bot operators:

| Guide                                                                                       | Topic                  | Time   |
| ------------------------------------------------------------------------------------------- | ---------------------- | ------ |
| [06-ADMIN-COMMUNICATION-COMMANDS.md](admin-guides/06-ADMIN-COMMUNICATION-COMMANDS.md)       | Admin commands         | 15 min |
| [AUTOMATIC-REGISTRATION-QUICK-START.md](admin-guides/AUTOMATIC-REGISTRATION-QUICK-START.md) | Auto-register commands | 5 min  |

---

### 🏗️ Architecture & Design

Deep dives into system design:

| Document                                                                  | Topic                       |
| ------------------------------------------------------------------------- | --------------------------- |
| [ARCHITECTURE-OVERVIEW.md](architecture/ARCHITECTURE-OVERVIEW.md)         | System design and patterns  |
| [FOLDER-STRUCTURE-ANALYSIS.md](architecture/FOLDER-STRUCTURE-ANALYSIS.md) | Project folder organization |

---

### 📖 Reference Documentation

Technical reference and API docs:

**Permission System (Latest)**
| Document | Purpose |
|----------|---------|
| [PHASE-3-PERMISSION-ENFORCEMENT.md](reference/PHASE-3-PERMISSION-ENFORCEMENT.md) | Permission enforcement implementation |
| [ROLE-BASED-PERMISSIONS-COMPLETE.md](reference/ROLE-BASED-PERMISSIONS-COMPLETE.md) | Complete permission system overview |

**Database & Configuration**
| Document | Purpose |
|----------|---------|
| [DB-DEPRECATION-TIMELINE.md](reference/DB-DEPRECATION-TIMELINE.md) | Legacy db.js deprecation (READ THIS!) |
| [DATABASE-MIGRATIONS.md](reference/DATABASE-MIGRATIONS.md) | Database schema changes |
| [DATABASE-OPTIMIZATION.md](reference/DATABASE-OPTIMIZATION.md) | Database performance tuning |
| [DATABASE-MIGRATION-FIXES.md](reference/DATABASE-MIGRATION-FIXES.md) | Migration troubleshooting |

**Permissions Deep Dive**
| Document | Purpose |
|----------|---------|
| [PERMISSION-MODEL.md](reference/PERMISSION-MODEL.md) | Permission system design |
| [PERMISSIONS-INDEX.md](reference/PERMISSIONS-INDEX.md) | Permission reference index |
| [PERMISSIONS-MATRIX.md](reference/PERMISSIONS-MATRIX.md) | Permission matrix reference |
| [PERMISSIONS-OVERVIEW.md](reference/PERMISSIONS-OVERVIEW.md) | Permission system overview |
| [PERMISSIONS-QUICK-REFERENCE.md](reference/PERMISSIONS-QUICK-REFERENCE.md) | Quick permission reference |

**Security & Operations**
| Document | Purpose |
|----------|---------|
| [SECURITY.md](reference/SECURITY.md) | Security best practices |
| [FEATURE-MODULES.md](reference/FEATURE-MODULES.md) | Feature module reference |
| [QUICK-REFERENCE.md](reference/QUICK-REFERENCE.md) | Quick reference guide |

---

### 🎯 Best Practices

Recommended practices and standards (Updated: Phase 19):

| Document                                                              | Topic                          | Status           |
| --------------------------------------------------------------------- | ------------------------------ | ---------------- |
| [CI-CD.md](best-practices/CI-CD.md)                                   | CI/CD setup & workflows        | ✅ Phase 19      |
| [CODE-QUALITY.md](best-practices/CODE-QUALITY.md)                     | Code quality standards         | ✅ Phase 19      |
| [COVERAGE-SETUP.md](best-practices/COVERAGE-SETUP.md)                 | Test coverage setup (Jest)     | ✅ Phase 19      |
| [ERROR-HANDLING.md](best-practices/ERROR-HANDLING.md)                 | Error handling patterns        | ✅ Current       |
| [GITHUB-ACTIONS.md](best-practices/GITHUB-ACTIONS.md)                 | GitHub Actions reference       | ✅ Current       |
| [PERFORMANCE-MONITORING.md](best-practices/PERFORMANCE-MONITORING.md) | Performance monitoring         | ✅ Current       |
| [SECURITY-HARDENING.md](best-practices/SECURITY-HARDENING.md)         | Security hardening guide       | ✅ Current       |
| [SEMANTIC-RELEASE-SETUP.md](best-practices/SEMANTIC-RELEASE-SETUP.md) | Semantic versioning setup      | ✅ Current       |
| [STABILITY-CHECKLIST.md](best-practices/STABILITY-CHECKLIST.md)       | Stability verification         | ✅ Current       |
| [TEST-COVERAGE-OVERVIEW.md](best-practices/TEST-COVERAGE-OVERVIEW.md) | Test coverage analysis (Phase 19) | ✅ Phase 19      |
| [TEST-SUMMARY-LATEST.md](best-practices/TEST-SUMMARY-LATEST.md)       | Test results (1,896+ passing)  | ✅ Phase 19      |
| [TEST-MAINTENANCE-GUIDE.md](best-practices/TEST-MAINTENANCE-GUIDE.md) | Test maintenance procedures    | ✅ Current       |

---

### 🎓 Tutorials

In-depth tutorials and learning materials:

Currently available in `tutorials/` directory.

---

### 🔌 API Documentation

API reference and endpoint documentation:

Currently available in `api/` directory.

---

## 🎯 Find What You Need

### By Role

**👨‍💻 Developer**

- Creating commands? → [01-CREATING-COMMANDS.md](user-guides/01-CREATING-COMMANDS.md)
- Writing tests? → [02-TESTING-GUIDE.md](user-guides/02-TESTING-GUIDE.md)
- Understanding architecture? → [ARCHITECTURE-OVERVIEW.md](architecture/ARCHITECTURE-OVERVIEW.md)

**🛠️ DevOps/Operator**

- Docker setup? → [DOCKER-SETUP.md](user-guides/DOCKER-SETUP.md)
- CI/CD? → [CI-CD-SETUP.md](best-practices/CI-CD-SETUP.md)
- Monitoring? → [PERFORMANCE-MONITORING.md](best-practices/PERFORMANCE-MONITORING.md)

**🔐 Administrator**

- Admin commands? → [06-ADMIN-COMMUNICATION-COMMANDS.md](admin-guides/06-ADMIN-COMMUNICATION-COMMANDS.md)
- Permissions? → [ROLE-BASED-PERMISSIONS-COMPLETE.md](reference/ROLE-BASED-PERMISSIONS-COMPLETE.md)
- Security? → [SECURITY-HARDENING.md](best-practices/SECURITY-HARDENING.md)

**📚 New Team Member**

1. Project overview → Project root [README.md](../README.md)
2. Architecture → [ARCHITECTURE-OVERVIEW.md](architecture/ARCHITECTURE-OVERVIEW.md)
3. Command creation → [01-CREATING-COMMANDS.md](user-guides/01-CREATING-COMMANDS.md)
4. Testing → [02-TESTING-GUIDE.md](user-guides/02-TESTING-GUIDE.md)
5. Troubleshooting → [SLASH-COMMANDS-TROUBLESHOOTING.md](user-guides/SLASH-COMMANDS-TROUBLESHOOTING.md)

### By Topic

**Permission System**

- Getting started → [ROLE-BASED-PERMISSIONS-COMPLETE.md](reference/ROLE-BASED-PERMISSIONS-COMPLETE.md)
- Implementation details → [PHASE-3-PERMISSION-ENFORCEMENT.md](reference/PHASE-3-PERMISSION-ENFORCEMENT.md)
- Quick reference → [PERMISSIONS-QUICK-REFERENCE.md](reference/PERMISSIONS-QUICK-REFERENCE.md)

**Commands & Slash Commands**

- Creating → [01-CREATING-COMMANDS.md](user-guides/01-CREATING-COMMANDS.md)
- Troubleshooting → [SLASH-COMMANDS-TROUBLESHOOTING.md](user-guides/SLASH-COMMANDS-TROUBLESHOOTING.md)

**Database**

- Migrations → [DATABASE-MIGRATIONS.md](reference/DATABASE-MIGRATIONS.md)
- Optimization → [DATABASE-OPTIMIZATION.md](reference/DATABASE-OPTIMIZATION.md)

**Deployment**

- Docker → [DOCKER-SETUP.md](user-guides/DOCKER-SETUP.md)
- CI/CD → [CI-CD-SETUP.md](best-practices/CI-CD-SETUP.md)

**Testing**

- Getting started → [02-TESTING-GUIDE.md](user-guides/02-TESTING-GUIDE.md)
- Coverage setup → [COVERAGE-SETUP.md](best-practices/COVERAGE-SETUP.md)

---

## 📋 Directory Structure

```
docs/
├── user-guides/              # Step-by-step guides for developers
│   ├── 01-CREATING-COMMANDS.md
│   ├── 02-TESTING-GUIDE.md
│   ├── 03-HUGGINGFACE-SETUP.md
│   ├── 04-PROXY-SETUP.md
│   ├── 05-REMINDER-SYSTEM.md
│   ├── DOCKER-SETUP.md
│   ├── DOCKER-WORKFLOW.md
│   ├── OPT-IN-SYSTEM.md
│   ├── RESOLUTION-HELPERS-GUIDE.md
│   └── SLASH-COMMANDS-TROUBLESHOOTING.md
├── admin-guides/             # Admin and operator guides
│   ├── 06-ADMIN-COMMUNICATION-COMMANDS.md
│   └── AUTOMATIC-REGISTRATION-QUICK-START.md
├── architecture/             # System design and structure
│   ├── ARCHITECTURE-OVERVIEW.md
│   └── FOLDER-STRUCTURE-ANALYSIS.md
├── best-practices/           # Recommended practices
│   ├── CI-CD-QUICK-START.md
│   ├── CODE-QUALITY.md
│   ├── ERROR-HANDLING.md
│   ├── SECURITY-HARDENING.md
│   ├── STABILITY-CHECKLIST.md
│   └── ... (13 total)
├── reference/                # Technical reference
│   ├── PHASE-3-PERMISSION-ENFORCEMENT.md
│   ├── ROLE-BASED-PERMISSIONS-COMPLETE.md
│   ├── DATABASE-MIGRATIONS.md
│   ├── PERMISSIONS-QUICK-REFERENCE.md
│   ├── SECURITY.md
│   └── ... (18 total)
├── tutorials/                # In-depth learning materials
├── api/                      # API documentation
├── archived/                 # Historical and obsolete docs
│   └── ... (20+ outdated files)
└── INDEX.md                  # This file
```

---

## 🔗 External Resources

- **[Project README](../README.md)** - Project overview and quick start
- **[Copilot Instructions](./.github/copilot-instructions.md)** - AI assistant guidelines
- **[Contributing Guide](../CONTRIBUTING.md)** - Contribution standards

---

## 🆘 Troubleshooting

**Can't find what you're looking for?**

1. Check the [Directory Structure](#-directory-structure) above
2. Use Ctrl+F to search this file
3. Check [archived/](archived/) for historical documentation
4. Review the [Troubleshooting Guide](user-guides/SLASH-COMMANDS-TROUBLESHOOTING.md)

**Links not working?**

- All links are relative to the `docs/` directory
- For links outside docs/, use `../` prefix

---

## 📈 Documentation Status

- **Last Updated:** January 3, 2026
- **Total Files:** 50+ active documents
- **Archived Files:** 20+ historical documents
- **Coverage:** Comprehensive (all major systems)

---

## 🤝 Contributing to Docs

Found a typo or outdated information?

1. Check if the file is in `archived/` (if so, it's intentionally archived)
2. Update the document directly
3. Verify all links still work
4. Keep inline with documentation style and structure
