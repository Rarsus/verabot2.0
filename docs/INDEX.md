# VeraBot2.0 Documentation Index

**Last Updated:** January 15, 2026  
**Status:** ✅ Fully Reorganized & Aligned with Convention  

Complete navigation for all VeraBot2.0 documentation within docs/ folder. See [../DOCUMENTATION-INDEX.md](../DOCUMENTATION-INDEX.md) for root-level documentation.

**📌 Note:** Archived documentation from completed phases is in [archived/](archived/).

---

## 🚀 Quick Start

**New to VeraBot2.0?**
1. [CONTRIBUTING.md](../CONTRIBUTING.md) - Start here
2. [reference/architecture/architecture.md](reference/architecture/architecture.md) - Learn the system
3. [user-guides/creating-commands.md](user-guides/creating-commands.md) - Create your first command

**Want to Deploy or Configure?**
1. Docker: [user-guides/docker-setup.md](user-guides/docker-setup.md)
2. Reminders: [user-guides/reminder-system.md](user-guides/reminder-system.md)
3. Proxy: [user-guides/proxy-setup.md](user-guides/proxy-setup.md)

---

## 📚 Documentation by Directory

### user-guides/ - End-User How-To Guides
Step-by-step guides for common tasks:
- creating-commands.md - Create new commands
- testing-guide.md - Write tests (TDD)
- huggingface-setup.md - Enable AI poem generation
- proxy-setup.md - Configure webhook proxy
- reminder-system.md - Use reminder system
- docker-setup.md, docker-workflow.md - Docker setup & workflow
- opt-in-system.md - User opt-in communication
- resolution-helpers-guide.md - Use response helpers
- slash-commands-troubleshooting.md - Fix slash command issues
- dashboard-access-configuration.md - Dashboard setup
- dashboard-login-troubleshooting.md - Login help
- discord-oauth-redirect-setup.md - OAuth setup
- **oauth-login-troubleshooting.md** *(NEW - Jan 15)*

### admin-guides/ - Administrator Guides
For server administrators and bot operators:
- admin-communication-commands.md - Discord admin communication
- automatic-registration-quick-start.md - Auto-registration setup

### guides/ - Developer Process Guides
Development workflow and infrastructure guides:
- dashboard-setup.md - Dashboard setup
- external-websocket-setup.md - WebSocket setup
- git-workflow-guide.md - Git workflow
- oauth-login-flow-fix.md - OAuth flow fixing
- **ci-cd-migration.md** *(NEW - Jan 15)* - CI/CD migration
- **scripts-improvements-guide.md** *(NEW - Jan 15)* - Scripts improvements
- **scripts-refactoring-guide.md** *(NEW - Jan 15)* - Scripts refactoring
- **workflow-improvements-guide.md** *(NEW - Jan 15)* - Workflow improvements
- **workflow-diagnostics-guide.md** *(NEW - Jan 15)* - Workflow diagnostics

### reference/ - Technical Reference (6 Subcategories)

#### reference/database/ - Database Specification & Schema
- database-guild-isolation-analysis.md - Guild isolation
- database-migration-fixes.md - Migration fixes
- database-migrations.md - Migration guide
- database-optimization.md - Performance optimization
- db-deprecation-timeline.md - Deprecation schedule
- multi-database-implementation.md - Multi-DB support
- reminder-schema.md - Reminder database schema

#### reference/permissions/ - Permission System & Roles
- permission-model.md - Permission model
- permission-system-summary.md - System overview
- permissions-index.md - Permissions index
- permissions-matrix.md - Roles matrix
- permissions-overview.md - Overview
- permissions-quick-reference.md - Quick reference
- permissions-visual.md - Visual guide
- role-based-permissions-complete.md - Full implementation
- role-permission-system-status.md - Current status

#### reference/configuration/ - Configuration & Environment
- configuration-audit-2026.md - Configuration audit *(NEW - Jan 15)*
- configuration-guide.md - Configuration guide *(NEW - Jan 15)*
- env-security-reference.md - Environment security

#### reference/architecture/ - System Architecture & Patterns
- architecture-patterns-visual.md - Visual patterns
- architecture.md - Main architecture
- command-database-patterns-analysis.md - Command patterns
- feature-modules.md - Feature modules
- global-services-migration-guide.md - Service migration
- refactoring-guide.md - Refactoring patterns
- tdd-quick-reference.md - TDD patterns

#### reference/quick-refs/ - Quick Reference Guides
- quick-reference.md - General reference
- command-reference-quick.md - Commands quick ref

#### reference/reports/ - Analysis Reports & Audits
- deprecated-code-audit.md - Deprecated code audit
- database-abstraction-analysis.md - Database abstraction
- scripts-analysis-report.md - Scripts analysis
- security.md - Security analysis
- Phase completion reports
- Analysis options

### architecture/ - System Design & Architecture
- architecture-overview.md - Architecture overview
- folder-structure-analysis.md - Folder structure
- role-quick-update-guide.md - Role system guide

### best-practices/ - Coding Standards & Best Practices
- ci-cd-setup.md, ci-cd.md - CI/CD best practices
- **ci-cd-quick-reference.md** *(NEW - Jan 15)* - CI/CD quick reference
- code-quality.md - Code quality
- coverage-setup.md - Coverage setup
- error-handling.md - Error handling
- github-actions.md - GitHub Actions
- performance-monitoring.md - Performance monitoring
- security-hardening.md - Security hardening
- semantic-release-setup.md - Release management
- stability-checklist.md - Stability checklist
- test-coverage-overview.md - Test coverage
- test-summary-latest.md - Latest test summary

### testing/ - Testing Frameworks & Patterns (NEWLY ORGANIZED - Jan 15)
Testing documentation consolidated in one place:
- **test-naming-convention-guide.md** *(NEW - Jan 15)* - Test naming standards
- **test-naming-convention-migration-plan.md** *(NEW - Jan 15)* - Migration planning
- **test-file-audit-report.md** *(NEW - Jan 15)* - File audit
- **test-coverage-baseline-strategy.md** *(NEW - Jan 15)* - Coverage strategy
- TEST-COVERAGE-OVERVIEW.md *(moved Jan 15)*
- TEST-MAINTENANCE-GUIDE.md *(moved Jan 15)*
- TEST-SUMMARY-LATEST.md *(moved Jan 15)*

### archived/ - Historical & Superseded Documentation
- PHASE-6/ - Phase 6 documentation (historical)
- PHASE-22.x/ - Phase 22 historical documentation
- PHASE-1/ - Phase 1 metrics
- Other historical documentation

---

## By Use Case

### 👨‍💻 I want to contribute code
1. [../CONTRIBUTING.md](../CONTRIBUTING.md) - Start here
2. [../DEFINITION-OF-DONE.md](../DEFINITION-OF-DONE.md) - Definition of done
3. [reference/architecture/](reference/architecture/) - System design
4. [best-practices/](best-practices/) - Coding standards

### 🧪 I want to write tests
1. [testing/test-naming-convention-guide.md](testing/test-naming-convention-guide.md) - Test naming
2. [reference/architecture/tdd-quick-reference.md](reference/architecture/tdd-quick-reference.md) - TDD patterns
3. [testing/](testing/) - All testing guides

### 🚀 I want to deploy infrastructure
1. [user-guides/docker-setup.md](user-guides/docker-setup.md) - Docker setup
2. [guides/ci-cd-migration.md](guides/ci-cd-migration.md) - CI/CD setup
3. [best-practices/ci-cd-quick-reference.md](best-practices/ci-cd-quick-reference.md) - CI/CD reference

### 🔐 I want to understand permissions
1. [reference/permissions/permissions-quick-reference.md](reference/permissions/permissions-quick-reference.md) - Quick start
2. [reference/permissions/permissions-matrix.md](reference/permissions/permissions-matrix.md) - Full matrix
3. [reference/permissions/](reference/permissions/) - All permission docs

### 📊 I want to understand the database
1. [reference/database/database-guild-isolation-analysis.md](reference/database/database-guild-isolation-analysis.md) - Guild isolation
2. [reference/database/db-deprecation-timeline.md](reference/database/db-deprecation-timeline.md) - Deprecation info
3. [reference/database/](reference/database/) - All database docs

---

## Root-Level Documentation

For root-level documentation including phases and standards, see:
- [../README.md](../README.md) - Project overview
- [../CONTRIBUTING.md](../CONTRIBUTING.md) - Developer guidelines
- [../DOCUMENTATION-INDEX.md](../DOCUMENTATION-INDEX.md) - Full documentation index
- [../DOCUMENT-NAMING-CONVENTION.md](../DOCUMENT-NAMING-CONVENTION.md) - Documentation standards

---

## Recent Changes (January 15, 2026)

✅ **Documentation reorganization completed**
- Archived 15+ historical phase documents
- Moved CI/CD and architecture docs to proper locations
- Created 6 subcategories in reference/ (database, permissions, configuration, architecture, quick-refs, reports)
- Consolidated testing documentation
- Created docs/testing/ with 7 consolidated test docs
- Created GitHub issues #61-67 for unaddressed problems

---

**Documentation Status:** ✅ Fully Reorganized (Jan 15, 2026)  
**See also:** [../DOCUMENTATION-INDEX.md](../DOCUMENTATION-INDEX.md) for root-level docs  
**Maintained By:** GitHub Copilot
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
