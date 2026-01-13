# Document Naming Convention Guide

**Version:** 1.0  
**Effective Date:** January 13, 2026  
**Status:** ACTIVE  
**Last Updated:** January 13, 2026  

---

## Overview

This guide establishes a consistent, easy-to-understand naming convention for all documentation across the VeraBot2.0 project. The goal is to make documents easily discoverable, categorizable, and maintainable.

---

## Core Principles

1. **Consistency First**: Same document types use the same naming pattern
2. **Clarity**: File name should indicate content type and purpose at a glance
3. **Discoverability**: Files should sort logically by type and date
4. **Scalability**: Pattern works as project grows
5. **Internationalization Ready**: No Unicode/special characters except hyphens

---

## Root-Level Document Categories

### Category 1: Project Management (PREFIX: None)
**Purpose**: High-level project information, governance  
**Location**: Root (`/`)  
**Naming Pattern**: `{DESCRIPTOR}.md`

**Examples**:
- `README.md` - Project overview (standardized)
- `CHANGELOG.md` - Version history (standardized)
- `CONTRIBUTING.md` - Contribution guidelines (standardized)
- `CODE_OF_CONDUCT.md` - Community standards (standardized)

**Note**: Use hyphens only if absolutely necessary for readability. Prefer underscores for common conventions.

### Category 2: Development Setup & Getting Started (PREFIX: None)
**Purpose**: Quick start guides, setup instructions  
**Location**: Root (`/`) or `docs/guides/`  
**Naming Pattern**: `GETTING-STARTED-{FEATURE}.md` or `SETUP-{COMPONENT}.md`

**Examples**:
- `GETTING-STARTED-DEV.md` - Dev environment setup
- `SETUP-DATABASE.md` - Database initialization
- `GETTING-STARTED-TESTING.md` - Testing environment setup

### Category 3: Process & Planning (PREFIX: PHASE)
**Purpose**: Phase-based deliverables, session summaries, planning docs  
**Location**: Root (`/`)  
**Naming Pattern**: `PHASE-{NUMBER}.{SUBPHASE}-{DESCRIPTOR}.md`

**Examples**:
- `PHASE-22.3-COVERAGE-EXPANSION-PLAN.md` - Phase plan
- `PHASE-22.3a-INITIALIZATION-SUMMARY.md` - Phase subphase summary
- `PHASE-22.3-COVERAGE-GAP-ANALYSIS.md` - Phase analysis
- `PHASE-22.3-SESSION-2-COMPLETION-REPORT.md` - Session reports

**Format Details**:
```
PHASE-{PHASE_NUM}.{SUBPHASE?}-{TYPE}-{DESCRIPTOR}.md
       ^^^^^^^^   ^^^^^^^^^^^^  ^^^^   ^^^^^^^^^^
         22.3       a (optional) COVERAGE EXPANSION-PLAN
```

### Category 4: Technical Reference (PREFIX: None)
**Purpose**: Architecture docs, API reference, technical specs  
**Location**: `docs/reference/` preferred, root if critical  
**Naming Pattern**: `{TYPE}-REFERENCE-{COMPONENT}.md` or `{COMPONENT}-REFERENCE.md`

**Examples**:
- `API-REFERENCE.md` - API documentation
- `DATABASE-REFERENCE.md` - Database schema reference
- `COMMAND-REFERENCE.md` - Command reference
- `ARCHITECTURE-REFERENCE.md` - System architecture

### Category 5: Testing & Quality (PREFIX: TEST)
**Purpose**: Testing guides, quality standards, coverage reports  
**Location**: Root (`/`) or `docs/testing/`  
**Naming Pattern**: `TEST-{DESCRIPTOR}.md`

**Examples**:
- `TEST-NAMING-CONVENTION-GUIDE.md` - Test naming standards
- `TEST-COVERAGE-ANALYSIS.md` - Coverage metrics
- `TEST-SUMMARY-LATEST.md` - Latest test results
- `TESTING-INITIATIVE-STATUS.md` - Testing project status

**Note**: Use `TEST-` prefix consistently for testing-related docs

### Category 6: Definitions & Standards (PREFIX: DEFINITION)
**Purpose**: Definition of Done, coding standards, quality criteria  
**Location**: Root (`/`)  
**Naming Pattern**: `DEFINITION-OF-{CONCEPT}.md`

**Examples**:
- `DEFINITION-OF-DONE.md` - DoD checklist
- `DEFINITION-OF-READY.md` - Definition of Ready criteria

### Category 7: Guides & How-To (PREFIX: None, organize by directory)
**Purpose**: Step-by-step guides for users, admins, developers  
**Location**: `docs/admin-guides/`, `docs/user-guides/`, `docs/guides/`  
**Naming Pattern**: `{AUDIENCE}-{ACTION-DESCRIPTOR}.md`

**Examples** (in `docs/admin-guides/`):
- `setup-database.md`
- `configure-webhooks.md`
- `manage-users.md`

**Examples** (in `docs/user-guides/`):
- `adding-quotes.md`
- `searching-quotes.md`
- `exporting-data.md`

**Examples** (in `docs/guides/`):
- `testing-guide.md`
- `contributing-code.md`

### Category 8: Status & Reports (PREFIX: Optional, include date if one-time report)
**Purpose**: Status reports, completion reports, progress updates  
**Location**: Root (`/`) then move to `docs/archived/` after phase complete  
**Naming Pattern**: `{TYPE}-STATUS-{DATE}.md` or `{PHASE}-{TYPE}-REPORT-{DATE}.md`

**Examples**:
- `PHASE-22.3a-COMPLETION-REPORT-JAN-13.md` - Phase completion
- `TESTING-INITIATIVE-STATUS-JAN-7.md` - Status snapshots
- `IMPLEMENTATION-STATUS-JANUARY-6-2026.md` - Detailed status

**Date Format**: 
- Short form (current convention): `JAN-7`, `JAN-13` ✅
- ISO 8601 form: `2026-01-13` ✅
- Full form: `JANUARY-6-2026` ✅
- **Avoid**: Mixed formats, abbreviations like `1-7` or `01/07`

### Category 9: Index & Navigation (PREFIX: None)
**Purpose**: Table of contents, index pages, navigation aids  
**Location**: Root (`/`) and `docs/`  
**Naming Pattern**: `{DESCRIPTOR}-INDEX.md` or just `INDEX.md`

**Examples**:
- `INDEX.md` - Root navigation (in `docs/`)
- `DOCUMENTATION-INDEX.md` - Docs overview (in root)
- `TEST-INDEX.md` - Testing docs navigation

---

## Naming Rules Summary

### ✅ DO Use
- **Hyphens** to separate words: `PHASE-22.3-COVERAGE-GAP-ANALYSIS.md`
- **UPPER-CASE** for root-level organization docs
- **Descriptive names** that indicate content without opening the file
- **Consistent prefixes** within categories: `PHASE-*`, `TEST-*`, `DEFINITION-*`
- **Periods** in version/phase numbers: `PHASE-22.3`, not `PHASE-223`
- **Date suffixes** for time-sensitive reports: `STATUS-JAN-13.md`

### ❌ DON'T Use
- **Spaces** in filenames (use hyphens instead)
- **Underscores** for separating words (except in established patterns like `CODE_OF_CONDUCT.md`)
- **Numbers only** for dates: Use `JAN-13` or `2026-01-13`, not `1-13`
- **Special characters** (except hyphens, underscores, periods)
- **Unclear abbreviations**: `CONV` vs `CONVENTION` - spell it out
- **Mixed case** in the middle: `PhaseX`, `TestX` (use all caps)

---

## Directory Structure Recommendations

### Proposed Structure (with standardization)

```
verabot2.0/
├── Root-level docs (project governance, phases, critical setup)
│   ├── README.md ✅
│   ├── CHANGELOG.md ✅
│   ├── CONTRIBUTING.md ✅
│   ├── CODE_OF_CONDUCT.md ✅
│   ├── DEFINITION-OF-DONE.md ✅
│   ├── GETTING-STARTED-DEV.md (NEW)
│   ├── PHASE-22.3-COVERAGE-EXPANSION-PLAN.md ✅
│   ├── PHASE-22.3-SESSION-SUMMARY.md (RENAME from 22.2-SESSION-SUMMARY)
│   ├── DOCUMENTATION-INDEX.md ✅
│   └── DOCUMENT-NAMING-CONVENTION.md (NEW - this file)
│
└── docs/
    ├── INDEX.md (master index)
    ├── admin-guides/
    │   ├── setup-database.md
    │   ├── configure-webhooks.md
    │   └── manage-permissions.md
    ├── user-guides/
    │   ├── adding-quotes.md
    │   ├── searching-quotes.md
    │   └── exporting-data.md
    ├── guides/
    │   ├── contributing-code.md
    │   ├── testing-guide.md
    │   └── development-setup.md
    ├── reference/
    │   ├── api-reference.md
    │   ├── database-schema.md
    │   ├── command-reference.md
    │   └── architecture-overview.md
    ├── architecture/
    │   ├── system-design.md
    │   ├── service-layer.md
    │   └── data-flow.md
    ├── best-practices/
    │   ├── code-style.md
    │   ├── testing-patterns.md
    │   └── documentation-standards.md
    ├── testing/
    │   ├── test-naming-guide.md
    │   ├── test-coverage.md
    │   └── test-patterns.md
    └── archived/
        ├── phase-22.1-summary/
        ├── phase-22.2-summary/
        └── ... (old phase docs)
```

---

## Implementation Guide

### For Root-Level Documents

**When creating a new doc, ask:**

1. **Is it project governance?**
   - Example: Contribution rules, Code of Conduct
   - Pattern: `{DESCRIPTOR}.md` (e.g., `CONTRIBUTING.md`)

2. **Is it a phase deliverable?**
   - Example: Phase plan, session summary
   - Pattern: `PHASE-{NUM}.{SUBPHASE?}-{TYPE}.md`

3. **Is it testing/quality related?**
   - Example: Coverage analysis, test guide
   - Pattern: `TEST-{DESCRIPTOR}.md`

4. **Is it a definition or standard?**
   - Example: Definition of Done
   - Pattern: `DEFINITION-OF-{CONCEPT}.md`

5. **Is it a status or report?**
   - Example: Completion report
   - Pattern: `{TYPE}-STATUS-{DATE}.md` or archive to `docs/archived/`

6. **Is it a setup/quick start guide?**
   - Example: Database setup
   - Pattern: `GETTING-STARTED-{FEATURE}.md` or `SETUP-{COMPONENT}.md`

7. **If none of the above**, ask for clarification and create appropriate pattern

### For docs/ Subdirectory Files

**Use lowercase with hyphens:**
- `docs/guides/testing-guide.md`
- `docs/admin-guides/setup-database.md`
- `docs/reference/api-reference.md`

---

## Examples by Document Type

### Phase Planning Documents
```
✅ PHASE-22.3-COVERAGE-EXPANSION-PLAN.md (master plan)
✅ PHASE-22.3-COVERAGE-GAP-ANALYSIS.md (analysis)
✅ PHASE-22.3-INITIALIZATION-SUMMARY.md (kickoff)
✅ PHASE-22.3a-COMPLETION-REPORT-JAN-13.md (subphase complete)
✅ PHASE-22.3-SESSION-2-COMPLETION-REPORT.md (session report)
```

### Testing Documents
```
✅ TEST-NAMING-CONVENTION-GUIDE.md (standard)
✅ TEST-COVERAGE-ANALYSIS.md (metrics)
✅ TEST-MIGRATION-EXECUTION-PLAN.md (project)
✅ TESTING-INITIATIVE-STATUS-JAN-7.md (status)
```

### Reference Documents
```
✅ COMMAND-REFERENCE-QUICK.md (quick ref)
✅ API-REFERENCE.md (full api ref)
✅ DATABASE-REFERENCE.md (schema ref)
```

### Setup Documents
```
✅ GETTING-STARTED-DEV.md (dev setup)
✅ GETTING-STARTED-TESTING.md (test setup)
✅ SETUP-DATABASE.md (db setup)
```

---

## Migration Plan

### Phase 1: Establish Convention (Jan 13, 2026)
- ✅ Create this guide
- ✅ Document current state
- ✅ Define new structure
- ✅ Communicate to team

### Phase 2: Rename Root Documents (Jan 13-14, 2026)
Documents to rename for consistency:
```
TESTING-INITIATIVE-STATUS-JAN-7.md
  → Move to docs/archived/ (historical report)
  
PHASE-22.2-SESSION-SUMMARY.md
  → PHASE-22.2-SESSION-SUMMARY.md (already correct)
  
PHASE-22.3-INITIALIZATION-SUMMARY.md  
  → PHASE-22.3a-INITIALIZATION-SUMMARY.md (add subphase)

TEST-NAMING-MIGRATION-EXECUTION-PLAN.md
  → TEST-NAMING-CONVENTION-MIGRATION-PLAN.md (clearer)
```

### Phase 3: Organize docs/ Folder (Jan 14-15, 2026)
- Remove generic `docs/guides/` - split to admin/user/development guides
- Move archived docs to `docs/archived/`
- Create `docs/testing/` for test-related documentation
- Update `docs/INDEX.md` to reflect structure

### Phase 4: Update Cross-References (Jan 15, 2026)
- Update `DOCUMENTATION-INDEX.md` with new names
- Update `docs/INDEX.md` with new structure
- Update any links in code comments

---

## Quick Reference Cheat Sheet

| Document Type | Location | Pattern | Example |
|---------------|----------|---------|---------|
| Project info | Root | `{DESCRIPTOR}.md` | `README.md`, `CHANGELOG.md` |
| Phase plan | Root | `PHASE-{#}.{a-z?}-{TYPE}.md` | `PHASE-22.3-COVERAGE-EXPANSION-PLAN.md` |
| Session report | Root then archive | `PHASE-{#}{x}-{TYPE}-{DATE}.md` | `PHASE-22.3a-COMPLETION-JAN-13.md` |
| Test guide | Root/docs | `TEST-{DESCRIPTOR}.md` | `TEST-NAMING-CONVENTION-GUIDE.md` |
| Definition | Root | `DEFINITION-OF-{CONCEPT}.md` | `DEFINITION-OF-DONE.md` |
| Quick start | Root | `GETTING-STARTED-{FEATURE}.md` | `GETTING-STARTED-DEV.md` |
| Admin guide | docs/admin-guides/ | `{action}.md` (lowercase) | `setup-database.md` |
| User guide | docs/user-guides/ | `{action}.md` (lowercase) | `adding-quotes.md` |
| Reference | docs/reference/ | `{component}-reference.md` | `api-reference.md` |

---

## Questions & Answers

**Q: Why hyphens instead of underscores?**  
A: Hyphens are more readable in URLs and command-line tools. Underscores are reserved for special conventions only (e.g., `CODE_OF_CONDUCT`).

**Q: What about documents that don't fit categories?**  
A: Create a new category following the same naming patterns, then update this guide. Consistency is key.

**Q: Should I include dates in all documents?**  
A: Only for time-sensitive reports (status updates, session summaries). Permanent docs don't need dates.

**Q: Can I use abbreviations?**  
A: Avoid abbreviations. Spell out words for clarity. Exception: Common acronyms like API, SQL are fine.

**Q: How do I handle version numbers?**  
A: Use periods for version numbers: `v1.0`, `PHASE-22.3`, not `v10` or `PHASE-223`.

---

## Maintenance

**Review Frequency**: Quarterly  
**Last Reviewed**: January 13, 2026  
**Next Review**: April 13, 2026  
**Responsible**: Technical Lead / Documentation Owner  

**Document Changes**:
- Update this file whenever adding new document categories
- Archive outdated documents to `docs/archived/`
- Keep `DOCUMENTATION-INDEX.md` synchronized

---

**Created**: January 13, 2026  
**Created By**: GitHub Copilot  
**Status**: ACTIVE  
**Scope**: All documentation in VeraBot2.0 project
