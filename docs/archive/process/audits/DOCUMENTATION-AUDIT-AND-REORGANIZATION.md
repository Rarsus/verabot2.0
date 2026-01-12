# Documentation Audit & Reorganization Plan

**Status:** In Progress  
**Date:** January 12, 2026  
**Total Root .md Files:** 120  
**Docs Folder .md Files:** 101  

---

## Phase 1: Root Documentation Categorization

### Category A: KEEP IN ROOT (Active Reference)

**Should remain in root - Core project documentation:**

1. **README.md** - Main project entry point (MUST STAY)
2. **CONTRIBUTING.md** - Contributor guidelines (MUST STAY)
3. **CODE_OF_CONDUCT.md** - Community standards (MUST STAY)
4. **CHANGELOG.md** - Version history (KEEP)
5. **COMMAND-REFERENCE-QUICK.md** - Command quick reference (KEEP)

**Decision: 5 files - KEEP IN ROOT**

---

### Category B: RECENT/ACTIVE DOCUMENTATION (Keep in Root)

**Created in latest sessions, actively in use:**

1. **TEST-NAMING-CONVENTION-GUIDE.md** - New naming standard (Jan 12)
2. **TEST-NAMING-CONVENTION-EXECUTIVE-SUMMARY.md** - Companion (Jan 12)
3. **TEST-NAMING-MIGRATION-EXECUTION-PLAN.md** - Active migration (Jan 12)
4. **PHASE-20-COMPLETION-REPORT.md** - Latest phase completion (Jan 7)
5. **PHASE-20-TESTING-ROADMAP.md** - Current testing direction (Jan 7)
6. **README.md** - Updated with Phase 20 status

**Decision: 6 files - KEEP IN ROOT** (Plus README listed above = 7 total in this category)

---

### Category C: COMPLETED PHASE DOCUMENTATION (Archive to docs/archive/phases/)

**These document completed phases 1-19 - ARCHIVE:**

| File | Phase | Status | Archive Path |
|------|-------|--------|--------------|
| PHASE-1-COMPLETION-REPORT.md | 1 | Complete | docs/archive/phases/phase1/ |
| PHASE-11-* | 11 | Complete | docs/archive/phases/phase11/ |
| PHASE-12-* | 12 | Complete | docs/archive/phases/phase12/ |
| PHASE-13-* | 13 | Complete | docs/archive/phases/phase13/ |
| PHASE-14-* | 14 | Complete | docs/archive/phases/phase14/ |
| PHASE-15-* | 15 | Complete | docs/archive/phases/phase15/ |
| PHASE-16-* | 16 | Complete | docs/archive/phases/phase16/ |
| PHASE-17-* | 17 | Complete | docs/archive/phases/phase17/ |
| PHASE-18-* | 18 | Complete | docs/archive/phases/phase18/ |
| PHASE-19-* | 19 | Complete | docs/archive/phases/phase19/ |

**Estimate: ~30-35 files**

**Decision: ARCHIVE TO docs/archive/phases/**

---

### Category D: SESSION/TASK DOCUMENTATION (Archive to docs/archive/sessions/)

**Temporary session notes and task summaries - ARCHIVE:**

1. SESSION-*-SUMMARY.md
2. SESSION-*-HANDOFF.md
3. SESSION-*-COMPLETION.md
4. TASK-*-COMPLETION.md
5. SESSION-HANDOFF-*.md
6. TASKS-1-3-COMPLETION-SUMMARY.md

**Estimate: ~8-10 files**

**Decision: ARCHIVE TO docs/archive/sessions/**

---

### Category E: COMPLETED FEATURE DOCUMENTATION (Archive to docs/archive/features/)

**Feature implementation completed - ARCHIVE:**

1. **DASHBOARD-IMPLEMENTATION-COMPLETE.md** - Completed
2. **DASHBOARD-IMPLEMENTATION-SUMMARY.md** - Summary
3. **GUILD-ISOLATION-REFACTORING-COMPLETE.md** - Completed
4. **CI-OPTIMIZATION-COMPLETE.md** - Completed
5. **JEST-MIGRATION-COMPLETE.md** - Completed
6. **AUTOMATIC-REGISTRATION-IMPLEMENTATION.md** - Completed

**Also includes:**
- DASHBOARD-DOCKER-OAUTH-ROADMAP.md (planning doc for completed feature)
- DASHBOARD-OAUTH-SETUP.md (setup guide for completed feature)
- DASHBOARD-QUICK-START.md (quick start for completed feature)
- GETTING-STARTED-DASHBOARD.md (getting started guide)

**Estimate: ~10-12 files**

**Decision: ARCHIVE TO docs/archive/features/**

---

### Category F: TECHNICAL ANALYSIS/RESOLVED ISSUES (Archive to docs/archive/analysis/)

**Technical analysis and resolved issues - keep for reference but archive:**

1. **ESLINT-TECHNICAL-DEBT-REPORT.md** - Resolved linting issues
2. **DEPRECATED-FUNCTIONS-ANALYSIS.md** - Deprecated items
3. **DEPRECATION-AUDIT.md** - Audit of deprecation
4. **CI-*-ANALYSIS.md** - CI analysis/resolution
5. **WHY-LOW-COVERAGE-ANALYSIS.md** - Coverage analysis
6. **TEST-COVERAGE-GAP-ANALYSIS.md** - Analysis document
7. **TEST-COVERAGE-PHASE-7-8-SUMMARY.md** - Phase summary
8. **WORKFLOW-VALIDATION-REPORT.md** - Validation report
9. **TEST-EXPANSION-DOCUMENTATION-INDEX.md** - Index
10. **TEST-EXPANSION-PROJECT-STATUS-REPORT.md** - Status

**Also includes:**
- GITHUB-ACTIONS-WORKFLOW-FIX.md (workflow issue - resolved)
- PR-FAILED-CHECKS-INVESTIGATION.md (investigation document)
- REMINDER-TIMEOUT-FIX.md (resolved issue)
- REMINDER-COMMAND-TIMEOUT-RESOLUTION.md (resolved issue)
- RESOLUTION-HELPERS-IMPLEMENTATION.md (implementation detail)

**Estimate: ~15-18 files**

**Decision: ARCHIVE TO docs/archive/analysis/**

---

### Category G: INFRASTRUCTURE/STATUS DOCUMENTATION (Archive to docs/archive/infrastructure/)

**Infrastructure setup and status tracking - ARCHIVE:**

1. **CI-ARCHITECTURE-VISUAL.md** - Architecture doc
2. **CI-CONFIGURATION-ANALYSIS.md** - Configuration doc
3. **CI-IMPLEMENTATION-GUIDE.md** - Implementation guide
4. **CI-README.md** - CI documentation
5. **CI-VALIDATION-SUMMARY.md** - Validation

**Also includes:**
- GUILD-ISOLATION-NEXT-STEPS.md (planning for completed feature)
- GUILD-ISOLATION-REFACTORING-STATUS.md (status tracking)
- GUILD-ISOLATION-REFACTORING-COMPLETE.md (completion report)
- SEMANTIC-RELEASE-README.md (release management)
- WEBSOCKET-QUICK-START.md (feature documentation)

**Estimate: ~10-12 files**

**Decision: ARCHIVE TO docs/archive/infrastructure/**

---

### Category H: PROCESS/INDEX DOCUMENTATION (Archive to docs/archive/process/)

**Process documentation and indices - ARCHIVE:**

1. **DOCUMENTATION-AUDIT-PHASE.md** - Audit documentation
2. **DOCUMENTATION-REORGANIZATION.md** - Reorganization doc
3. **COVERAGE-AND-TDD-SUMMARY.md** - Summary
4. **COVERAGE-TDD-INDEX.md** - Index
5. **CODE-COVERAGE-ANALYSIS-PLAN.md** - Analysis plan
6. **TEST-EXPANSION-DOCUMENTATION-INDEX.md** - Index
7. **MCP-IMPLEMENTATION-SUMMARY.md** - MCP summary
8. **MCP-QUICK-REFERENCE.md** - MCP reference

**Estimate: ~8 files**

**Decision: ARCHIVE TO docs/archive/process/**

---

## Phase 2: Archival Structure

Create following directory structure in `docs/archive/`:

```
docs/archive/
├── phases/                     # Phase documentation (1-20)
│   ├── phase1/
│   ├── phase2/
│   ├── ...
│   ├── phase19/
│   └── phase20/
├── sessions/                   # Session handoff and task docs
│   └── [session-date]/
├── features/                   # Completed feature documentation
│   ├── dashboard/
│   ├── guild-isolation/
│   ├── ci-cd/
│   ├── jest-migration/
│   └── automatic-registration/
├── analysis/                   # Technical analysis and resolved issues
│   ├── linting/
│   ├── coverage/
│   ├── workflow/
│   └── resolved-issues/
├── infrastructure/             # Infrastructure documentation
│   ├── ci-architecture/
│   ├── release-management/
│   └── websocket/
└── process/                    # Process and index documentation
    ├── documentation-audits/
    ├── coverage-tracking/
    └── mcp/
```

---

## Phase 3: Summary of Changes

### Files to KEEP IN ROOT (11 files)
✅ README.md  
✅ CONTRIBUTING.md  
✅ CODE_OF_CONDUCT.md  
✅ CHANGELOG.md  
✅ COMMAND-REFERENCE-QUICK.md  
✅ TEST-NAMING-CONVENTION-GUIDE.md  
✅ TEST-NAMING-CONVENTION-EXECUTIVE-SUMMARY.md  
✅ TEST-NAMING-MIGRATION-EXECUTION-PLAN.md  
✅ PHASE-20-COMPLETION-REPORT.md  
✅ PHASE-20-TESTING-ROADMAP.md  
✅ TEST-FRAMEWORK-ROADMAP.md (new - to create)  

### Files to ARCHIVE (109 files)

**docs/archive/phases/** (~30 files)  
**docs/archive/sessions/** (~8 files)  
**docs/archive/features/** (~12 files)  
**docs/archive/analysis/** (~18 files)  
**docs/archive/infrastructure/** (~12 files)  
**docs/archive/process/** (~8 files)  
**docs/archive/other/** (~21 files)  

---

## Phase 4: Implementation Checklist

### Step 1: Create Archive Directory Structure
```bash
mkdir -p docs/archive/{phases,sessions,features,analysis,infrastructure,process,other}
```

### Step 2: Move Phase Documentation (Groups by phase)
```bash
# Phase 1-20 documentation
for phase in {1..20}; do
  mkdir -p docs/archive/phases/phase${phase}
  find . -maxdepth 1 -name "PHASE-${phase}-*.md" -exec mv {} docs/archive/phases/phase${phase}/ \;
done
```

### Step 3: Move Session Documentation
```bash
mkdir -p docs/archive/sessions
mv SESSION-*.md docs/archive/sessions/
mv TASKS-*.md docs/archive/sessions/
mv *-HANDOFF-*.md docs/archive/sessions/
```

### Step 4: Move Feature Documentation
```bash
mkdir -p docs/archive/features/{dashboard,guild-isolation,ci-cd,jest,registration}
mv DASHBOARD-*.md docs/archive/features/dashboard/
mv GUILD-ISOLATION-*.md docs/archive/features/guild-isolation/
mv JEST-*.md docs/archive/features/jest/
mv AUTOMATIC-REGISTRATION-*.md docs/archive/features/registration/
```

### Step 5: Move Analysis Documentation
```bash
mkdir -p docs/archive/analysis/{linting,coverage,workflow,issues}
mv ESLINT-*.md docs/archive/analysis/linting/
mv CODE-COVERAGE-*.md docs/archive/analysis/coverage/
mv COVERAGE-*.md docs/archive/analysis/coverage/
mv TEST-COVERAGE-*.md docs/archive/analysis/coverage/
mv *-WORKFLOW-*.md docs/archive/analysis/workflow/
mv *-INVESTIGATION.md docs/archive/analysis/issues/
```

### Step 6: Move Infrastructure Documentation
```bash
mkdir -p docs/archive/infrastructure/{ci,release,websocket}
mv CI-*.md docs/archive/infrastructure/ci/
mv SEMANTIC-RELEASE-*.md docs/archive/infrastructure/release/
mv WEBSOCKET-*.md docs/archive/infrastructure/websocket/
```

### Step 7: Move Process Documentation
```bash
mkdir -p docs/archive/process/{audits,coverage,mcp}
mv DOCUMENTATION-*.md docs/archive/process/audits/
mv *-COVERAGE-*.md docs/archive/process/coverage/
mv MCP-*.md docs/archive/process/mcp/
```

### Step 8: Move Remaining Files
```bash
# Move anything else
mv DEPRECATED-*.md docs/archive/other/
mv DEPRECATION-*.md docs/archive/other/
mv WHY-*.md docs/archive/other/
mv *-SUMMARY.md docs/archive/other/  # Non-phase/session summaries
```

### Step 9: Update docs/INDEX.md
- Remove links to archived documents
- Add link to docs/archive/ directory
- Update structure reference

### Step 10: Create docs/archive/INDEX.md
- Index all archived documentation by category
- Explain archive structure
- Note that these are for historical reference

### Step 11: Verify All Links
- Search root README and CONTRIBUTING for markdown links
- Update any broken links to point to docs/archive/
- Check package.json for any doc references

### Step 12: Commit Changes
```bash
git add -A
git commit -m "chore: reorganize documentation - archive completed phases and analysis

Moved 109 files to docs/archive/ by category:
- docs/archive/phases/: Phase 1-20 documentation (30 files)
- docs/archive/sessions/: Session handoff and task docs (8 files)
- docs/archive/features/: Completed feature docs (12 files)
- docs/archive/analysis/: Technical analysis and issues (18 files)
- docs/archive/infrastructure/: Infrastructure setup (12 files)
- docs/archive/process/: Process and index docs (8 files)
- docs/archive/other/: Miscellaneous docs (21 files)

KEPT IN ROOT (11 files):
- Core project docs (README, CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG)
- Latest phase docs (PHASE-20-*)
- Active conventions (TEST-NAMING-*, TEST-FRAMEWORK-*)

Updated:
- docs/INDEX.md with archive structure
- Created docs/archive/INDEX.md
- All documentation links verified

Benefits:
- Root directory is cleaner (~11 files instead of 120)
- Better organization by category and phase
- Easier navigation for new contributors
- Historical reference preserved in archive"
```

---

## Success Criteria

✅ Root directory reduced from 120 to 11 documentation files  
✅ All 109 archived files organized into logical categories  
✅ All markdown links working (tested with grep + curl)  
✅ Git history preserved  
✅ Archive structure matches docs/ folder organization  
✅ docs/archive/INDEX.md provides clear navigation  

---

## Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Create archive structure | 10 min | ⏳ Next |
| 2-8 | Move files by category | 30 min | ⏳ Next |
| 9 | Update documentation links | 20 min | ⏳ Next |
| 10 | Verify all links work | 15 min | ⏳ Next |
| 11 | Create archive index | 15 min | ⏳ Next |
| 12 | Final commit | 5 min | ⏳ Next |

**TOTAL: ~1.5 hours**

