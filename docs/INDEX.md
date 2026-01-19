# VeraBot2.0 Documentation Index

**Last Updated:** January 15, 2026  
**Status:** ✅ Fully Reorganized & Aligned with Convention  

Complete navigation for all VeraBot2.0 documentation within docs/ folder. See [../DOCUMENTATION-INDEX.md](../DOCUMENTATION-INDEX.md) for root-level documentation.

**📌 Note:** Archived documentation from completed phases is in [archived/](archived/).

---

## 🚀 Quick Start

**New to VeraBot2.0?**
1. [CONTRIBUTING.md](../CONTRIBUTING.md) - Start here
2. [reference/architecture/ARCHITECTURE.md](reference/architecture/ARCHITECTURE.md) - Learn the system
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
- DATABASE-GUILD-ISOLATION-ANALYSIS.md - Guild isolation
- DATABASE-MIGRATION-FIXES.md - Migration fixes
- DATABASE-MIGRATIONS.md - Migration guide
- DATABASE-OPTIMIZATION.md - Performance optimization
- (See also: [DB-DEPRECATION-TIMELINE.md](reference/DB-DEPRECATION-TIMELINE.md) - Deprecation schedule)
- MULTI-DATABASE-IMPLEMENTATION.md - Multi-DB support
- REMINDER-SCHEMA.md - Reminder database schema

#### reference/permissions/ - Permission System & Roles
- PERMISSION-MODEL.md - Permission model
- PERMISSION-SYSTEM-SUMMARY.md - System overview
- PERMISSIONS-INDEX.md - Permissions index
- PERMISSIONS-MATRIX.md - Roles matrix
- PERMISSIONS-OVERVIEW.md - Overview
- PERMISSIONS-QUICK-REFERENCE.md - Quick reference
- PERMISSIONS-VISUAL.md - Visual guide
- ROLE-BASED-PERMISSIONS-COMPLETE.md - Full implementation
- ROLE-PERMISSION-SYSTEM-STATUS.md - Current status

#### reference/configuration/ - Configuration & Environment
- CONFIGURATION-GUIDE.md - Configuration guide *(NEW - Jan 15)*
- ENV-SECURITY-REFERENCE.md - Environment security

#### reference/architecture/ - System Architecture & Patterns
- ARCHITECTURE-PATTERNS-VISUAL.md - Visual patterns
- ARCHITECTURE.md - Main architecture
- COMMAND-DATABASE-PATTERNS-ANALYSIS.md - Command patterns
- FEATURE-MODULES.md - Feature modules
- GLOBAL-SERVICES-MIGRATION-GUIDE.md - Service migration
- REFACTORING-GUIDE.md - Refactoring patterns
- (See also: [reference/quick-refs/TDD-QUICK-REFERENCE.md](reference/quick-refs/TDD-QUICK-REFERENCE.md) - TDD patterns)

#### reference/quick-refs/ - Quick Reference Guides
- QUICK-REFERENCE.md - General reference
- TDD-QUICK-REFERENCE.md - TDD patterns

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
2. [reference/quick-refs/TDD-QUICK-REFERENCE.md](reference/quick-refs/TDD-QUICK-REFERENCE.md) - TDD patterns
3. [testing/](testing/) - All testing guides

### 🚀 I want to deploy infrastructure
1. [user-guides/docker-setup.md](user-guides/docker-setup.md) - Docker setup
2. [guides/ci-cd-migration.md](guides/ci-cd-migration.md) - CI/CD setup
3. [best-practices/ci-cd-quick-reference.md](best-practices/ci-cd-quick-reference.md) - CI/CD reference

### 🔐 I want to understand permissions
1. [reference/permissions/PERMISSIONS-QUICK-REFERENCE.md](reference/permissions/PERMISSIONS-QUICK-REFERENCE.md) - Quick start
2. [reference/permissions/PERMISSIONS-MATRIX.md](reference/permissions/PERMISSIONS-MATRIX.md) - Full matrix
3. [reference/permissions/](reference/permissions/) - All permission docs

### 📊 I want to understand the database
1. [reference/database/DATABASE-GUILD-ISOLATION-ANALYSIS.md](reference/database/DATABASE-GUILD-ISOLATION-ANALYSIS.md) - Guild isolation
2. [reference/database/DB-DEPRECATION-TIMELINE.md](reference/DB-DEPRECATION-TIMELINE.md) - Deprecation info
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
| [admin-communication-commands.md](admin-guides/admin-communication-commands.md)       | Admin commands         | 15 min |
| [automatic-registration-quick-start.md](admin-guides/automatic-registration-quick-start.md) | Auto-register commands | 5 min  |

---

### 🏗️ Architecture & Design

Deep dives into system design:

| Document                                                                  | Topic                       |
| ------------------------------------------------------------------------- | --------------------------- |
| [reference/architecture/ARCHITECTURE.md](reference/architecture/ARCHITECTURE.md)         | System design and patterns  |
| [folder-structure-analysis.md](architecture/folder-structure-analysis.md) | Project folder organization |

---

### 📖 Reference Documentation

Technical reference and API docs:

**Permission System (Latest)**
| Document | Purpose |
|----------|---------|
| [PHASE-3-PERMISSION-ENFORCEMENT.md](reference/reports/PHASE-3-PERMISSION-ENFORCEMENT.md) | Permission enforcement implementation |
| [reference/permissions/ROLE-BASED-PERMISSIONS-COMPLETE.md](reference/permissions/ROLE-BASED-PERMISSIONS-COMPLETE.md) | Complete permission system overview |

**Database & Configuration**
| Document | Purpose |
|----------|---------|
| [reference/DB-DEPRECATION-TIMELINE.md](reference/DB-DEPRECATION-TIMELINE.md) | Legacy db.js deprecation (READ THIS!) |
| [reference/database/DATABASE-MIGRATIONS.md](reference/database/DATABASE-MIGRATIONS.md) | Database schema changes |
| [reference/database/DATABASE-OPTIMIZATION.md](reference/database/DATABASE-OPTIMIZATION.md) | Database performance tuning |
| [reference/database/DATABASE-MIGRATION-FIXES.md](reference/database/DATABASE-MIGRATION-FIXES.md) | Migration troubleshooting |

**Permissions Deep Dive**
| Document | Purpose |
|----------|---------|
| [reference/permissions/PERMISSION-MODEL.md](reference/permissions/PERMISSION-MODEL.md) | Permission system design |
| [reference/permissions/PERMISSIONS-INDEX.md](reference/permissions/PERMISSIONS-INDEX.md) | Permission reference index |
| [reference/permissions/PERMISSIONS-MATRIX.md](reference/permissions/PERMISSIONS-MATRIX.md) | Permission matrix reference |
| [reference/permissions/PERMISSIONS-OVERVIEW.md](reference/permissions/PERMISSIONS-OVERVIEW.md) | Permission system overview |
| [reference/permissions/PERMISSIONS-QUICK-REFERENCE.md](reference/permissions/PERMISSIONS-QUICK-REFERENCE.md) | Quick permission reference |

**Security & Operations**
| Document | Purpose |
|----------|---------|
| [SECURITY.md](reference/reports/SECURITY.md) | Security best practices |
| [reference/architecture/FEATURE-MODULES.md](reference/architecture/FEATURE-MODULES.md) | Feature module reference |
| [reference/quick-refs/QUICK-REFERENCE.md](reference/quick-refs/QUICK-REFERENCE.md) | Quick reference guide |

---

### 🎯 Best Practices

Recommended practices and standards (Updated: Phase 19):

| Document                                                              | Topic                          | Status           |
| --------------------------------------------------------------------- | ------------------------------ | ---------------- |
| [ci-cd.md](best-practices/ci-cd.md)                                   | CI/CD setup & workflows        | ✅ Phase 19      |
| [code-quality.md](best-practices/code-quality.md)                     | Code quality standards         | ✅ Phase 19      |
| [coverage-setup.md](best-practices/coverage-setup.md)                 | Test coverage setup (Jest)     | ✅ Phase 19      |
| [error-handling.md](best-practices/error-handling.md)                 | Error handling patterns        | ✅ Current       |
| [github-actions.md](best-practices/github-actions.md)                 | GitHub Actions reference       | ✅ Current       |
| [performance-monitoring.md](best-practices/performance-monitoring.md) | Performance monitoring         | ✅ Current       |
| [security-hardening.md](best-practices/security-hardening.md)         | Security hardening guide       | ✅ Current       |
| [semantic-release-setup.md](best-practices/semantic-release-setup.md) | Semantic versioning setup      | ✅ Current       |
| [stability-checklist.md](best-practices/stability-checklist.md)       | Stability verification         | ✅ Current       |
| [test-coverage-overview.md](best-practices/test-coverage-overview.md) | Test coverage analysis (Phase 19) | ✅ Phase 19      |
| [test-summary-latest.md](best-practices/test-summary-latest.md)       | Test results (1,896+ passing)  | ✅ Phase 19      |
| [TEST-MAINTENANCE-GUIDE.md](testing/TEST-MAINTENANCE-GUIDE.md) | Test maintenance procedures    | ✅ Current       |

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

- Creating commands? → [user-guides/creating-commands.md](user-guides/creating-commands.md)
- Writing tests? → [user-guides/testing-guide.md](user-guides/testing-guide.md)
- Understanding architecture? → [reference/architecture/ARCHITECTURE.md](reference/architecture/ARCHITECTURE.md)

**🛠️ DevOps/Operator**

- Docker setup? → [docker-setup.md](user-guides/docker-setup.md)
- CI/CD? → [ci-cd-setup.md](best-practices/ci-cd-setup.md)
- Monitoring? → [performance-monitoring.md](best-practices/performance-monitoring.md)

**🔐 Administrator**

- Admin commands? → [admin-communication-commands.md](admin-guides/admin-communication-commands.md)
- Permissions? → [ROLE-BASED-PERMISSIONS-COMPLETE.md](reference/permissions/ROLE-BASED-PERMISSIONS-COMPLETE.md)
- Security? → [security-hardening.md](best-practices/security-hardening.md)

**📚 New Team Member**

1. Project overview → Project root [README.md](../README.md)
2. Architecture → [architecture-overview.md](architecture/architecture-overview.md)
3. Command creation → [creating-commands.md](user-guides/creating-commands.md)
4. Testing → [testing-guide.md](user-guides/testing-guide.md)
5. Troubleshooting → [slash-commands-troubleshooting.md](user-guides/slash-commands-troubleshooting.md)

### By Topic

**Permission System**

- Getting started → [ROLE-BASED-PERMISSIONS-COMPLETE.md](reference/permissions/ROLE-BASED-PERMISSIONS-COMPLETE.md)
- Implementation details → [PHASE-3-PERMISSION-ENFORCEMENT.md](reference/reports/PHASE-3-PERMISSION-ENFORCEMENT.md)
- Quick reference → [PERMISSIONS-QUICK-REFERENCE.md](reference/permissions/PERMISSIONS-QUICK-REFERENCE.md)

**Commands & Slash Commands**

- Creating → [CREATING-COMMANDS.md](user-guides/creating-commands.md)
- Troubleshooting → [SLASH-COMMANDS-TROUBLESHOOTING.md](user-guides/slash-commands-troubleshooting.md)

**Database**

- Migrations → [DATABASE-MIGRATIONS.md](reference/database/DATABASE-MIGRATIONS.md)
- Optimization → [DATABASE-OPTIMIZATION.md](reference/database/DATABASE-OPTIMIZATION.md)

**Deployment**

- Docker → [docker-setup.md](user-guides/docker-setup.md)
- CI/CD → [ci-cd-setup.md](best-practices/ci-cd-setup.md)

**Testing**

- Getting started → [testing-guide.md](user-guides/testing-guide.md)
- Coverage setup → [coverage-setup.md](best-practices/coverage-setup.md)

---

## 📋 Directory Structure

```
docs/
├── user-guides/              # Step-by-step guides for developers
│   ├── creating-commands.md
│   ├── testing-guide.md
│   ├── huggingface-setup.md
│   ├── proxy-setup.md
│   ├── reminder-system.md
│   ├── docker-setup.md
│   ├── docker-workflow.md
│   ├── opt-in-system.md
│   ├── resolution-helpers-guide.md
│   └── slash-commands-troubleshooting.md
├── admin-guides/             # Admin and operator guides
│   ├── 06-ADMIN-COMMUNICATION-COMMANDS.md
│   └── AUTOMATIC-REGISTRATION-QUICK-START.md
├── architecture/             # System design and structure
│   ├── ARCHITECTURE-OVERVIEW.md
│   └── folder-structure-analysis.md
├── best-practices/           # Recommended practices
│   ├── ci-cd-quick-reference.md
│   ├── code-quality.md
│   ├── error-handling.md
│   ├── security-hardening.md
│   ├── stability-checklist.md
│   └── ... (13 total)
├── reference/                # Technical reference
│   ├── PHASE-3-PERMISSION-ENFORCEMENT.md
│   ├── ROLE-BASED-PERMISSIONS-COMPLETE.md
│   ├── DATABASE-MIGRATIONS.md (in database/ subdirectory)
│   ├── PERMISSIONS-QUICK-REFERENCE.md (in permissions/ subdirectory)
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
- **[Copilot Instructions](../.github/copilot-instructions.md)** - AI assistant guidelines
- **[Contributing Guide](../CONTRIBUTING.md)** - Contribution standards

---

## 🆘 Troubleshooting

**Can't find what you're looking for?**

1. Check the [Directory Structure](#-directory-structure) above
2. Use Ctrl+F to search this file
3. Check [archived/](archived/) for historical documentation
4. Review the [Troubleshooting Guide](user-guides/slash-commands-troubleshooting.md)

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
