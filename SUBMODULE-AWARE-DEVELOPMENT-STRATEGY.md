# Submodule-Aware Development Strategy & Phase 2.5 Planning

**Document Date:** January 21, 2026  
**Status:** ✅ Phase 2 Complete - Phase 2.5 Planning  
**Audience:** Copilot, Development Team, Technical Leadership  

---

## Table of Contents

1. [Submodule Architecture Overview](#submodule-architecture-overview)
2. [Code Placement Guidelines](#code-placement-guidelines)
3. [Copilot Instructions - Key Updates](#copilot-instructions---key-updates)
4. [Phase 2.5: Commands Module Planning](#phase-25-commands-module-planning)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Team Workflows](#team-workflows)
7. [Future Phases Consideration](#future-phases-consideration)

---

## Submodule Architecture Overview

### Current Structure (Post-Phase 2)

```
verabot2.0/ (Main Repository - Git Coordinator)
│
├── repos/verabot-core/          (v1.0.0)
│   ├── src/
│   │   ├── index.js             (Bot entry point)
│   │   ├── core/                (Core classes)
│   │   ├── services/            (Business logic)
│   │   ├── middleware/          (Cross-cutting concerns)
│   │   └── commands/            (TEMPORARY - moving to Phase 2.5)
│   └── tests/
│
├── repos/verabot-dashboard/     (v1.0.0)
│   ├── src/
│   │   ├── app.js
│   │   └── components/
│   └── public/
│
├── repos/verabot-utils/         (v1.0.0)
│   ├── src/
│   │   ├── services/
│   │   │   ├── DatabaseService.js
│   │   │   └── ...
│   │   ├── middleware/
│   │   ├── helpers/
│   │   └── utils/
│   └── tests/
│
└── repos/verabot-commands/      (Phase 2.5 - COMING)
    ├── src/
    │   ├── commands/
    │   │   ├── misc/
    │   │   ├── quote-discovery/
    │   │   ├── quote-management/
    │   │   ├── quote-social/
    │   │   └── quote-export/
    │   ├── register-commands.js
    │   └── index.js
    └── tests/
```

### Key Characteristics

**Independent Versioning:** Each submodule maintains separate version tags
- verabot-core: v1.0.0
- verabot-dashboard: v1.0.0
- verabot-utils: v1.0.0
- verabot-commands: v1.0.0 (Phase 2.5)

**Unified Coordination:** Main repository (.gitmodules) tracks all submodules

**Clear Boundaries:** Each submodule has distinct responsibility domain

**Shared Utilities:** Common code centralized in verabot-utils for reuse

---

## Code Placement Guidelines

### Responsibility Mapping Table

| Code Type | Target Submodule | Characteristics | Examples |
|-----------|------------------|-----------------|----------|
| **Commands** | `repos/verabot-commands` | User-facing Discord commands, slash & prefix | All *.js files in commands/ |
| **Services** | `repos/verabot-utils` | Business logic, database ops, validation | DatabaseService, QuoteService |
| **Middleware** | `repos/verabot-core` | Error handling, logging, cross-cutting | errorHandler, logger |
| **Event Handlers** | `repos/verabot-core` | Discord event listeners | ready, messageCreate |
| **Dashboard UI** | `repos/verabot-dashboard` | Web interface, React components | Dashboard, Settings pages |
| **Response Helpers** | `repos/verabot-utils` | Discord message formatting | sendSuccess, sendError |
| **Core Bot Logic** | `repos/verabot-core` | Bot initialization, lifecycle | Bot setup, startup |
| **Tests** | Same submodule as code | Unit & integration tests | tests/ in each module |

### Decision Tree for Code Placement

```
Does the code implement a Discord command?
├─ YES → repos/verabot-commands
└─ NO  → Is it business logic or a service?
         ├─ YES → repos/verabot-utils
         └─ NO  → Is it core bot infrastructure?
                  ├─ YES → repos/verabot-core
                  └─ NO  → Is it UI/Dashboard?
                           ├─ YES → repos/verabot-dashboard
                           └─ NO  → Needs discussion with team
```

### Critical Rules (NON-NEGOTIABLE)

1. ❌ **NEVER** put commands in `repos/verabot-core`
   - Commands belong in `repos/verabot-commands` (Phase 2.5+)
   - Currently in verabot-core until Phase 2.5 extraction

2. ❌ **NEVER** put shared utilities in submodule-specific modules
   - All reusable code must be in `repos/verabot-utils`
   - Prevents duplication and inconsistency

3. ❌ **NEVER** put database services anywhere except `repos/verabot-utils`
   - DatabaseService is the single source of truth
   - All data operations go through this module

4. ❌ **NEVER** import code across submodules except:
   - From other modules TO verabot-utils (allowed - it's shared)
   - FROM verabot-utils TO other modules (allowed - it's shared)
   - FROM verabot-commands TO verabot-utils (allowed)
   - FROM verabot-core TO verabot-utils (allowed)

5. ✅ **ALWAYS** write tests in the same submodule as the code

6. ✅ **ALWAYS** verify current working directory before creating files

---

## Copilot Instructions - Key Updates

### New Section Added: "CRITICAL: Submodule-Aware Development - MANDATORY"

**Location:** `.github/copilot-instructions.md` (Lines 1-110)

**Key Content:**
- Submodule responsibility mapping table
- Code placement decision rules
- Import guidelines with correct/incorrect examples
- Validation procedure for module placement
- Phase 2.5 Commands Module reference

### Updated Throughout Document

**Import Patterns:** Updated to show submodule-relative paths

**Example Commands:** Show commands in `repos/verabot-commands` when Phase 2.5 complete

**Architecture Section:** Reflects four-module structure

**Project Structure Section:** Includes `repos/verabot-commands/` structure

### Critical for Copilot Behavior

**Copilot MUST:**
- ✅ Check submodule responsibility mapping before any code creation
- ✅ Verify working directory is correct for code type
- ✅ Use proper import paths for submodule access
- ✅ Refuse to place commands in verabot-core
- ✅ Suggest correct location if wrong module proposed
- ✅ Include tests in same submodule as code
- ✅ Reference copilot-instructions for any unclear placement

---

## Phase 2.5: Commands Module Planning

### Phase 2.5 Scope

Extract all Discord commands from `repos/verabot-core/src/commands/` to new dedicated module.

**Timing:** Between Phase 2 (Git Submodules - ✅ Complete) and Phase 3 (Full Repository Separation - Future)

**Duration:** 3-4 days

**Team Size:** 1-2 developers

### Phase 2.5 Objectives

#### Objective 1: Create Commands Repository
```bash
# Create new repository
github.com/Rarsus/verabot-commands

# Initialize with:
- README.md with commands documentation
- LICENSE (same as main project)
- .gitignore (Node.js standard)
- package.json (with command-specific dependencies)
- GitHub topics: verabot, discord-bot, commands, submodule
```

#### Objective 2: Define Module Structure
```
repos/verabot-commands/
├── src/
│   ├── commands/
│   │   ├── misc/                    # General utility
│   │   │   ├── hi.js
│   │   │   ├── ping.js
│   │   │   ├── help.js
│   │   │   └── poem.js
│   │   ├── quote-discovery/         # Search & discovery
│   │   │   ├── random-quote.js
│   │   │   ├── search-quotes.js
│   │   │   └── quote-stats.js
│   │   ├── quote-management/        # CRUD operations
│   │   │   ├── add-quote.js
│   │   │   ├── delete-quote.js
│   │   │   ├── update-quote.js
│   │   │   ├── list-quotes.js
│   │   │   └── quote.js
│   │   ├── quote-social/            # Social features
│   │   │   ├── rate-quote.js
│   │   │   └── tag-quote.js
│   │   └── quote-export/            # Export functionality
│   │       └── export-quotes.js
│   ├── register-commands.js         # Command registration
│   └── index.js                     # Module entry point
├── tests/
│   ├── unit/
│   │   ├── commands/
│   │   │   ├── misc/
│   │   │   ├── quote-discovery/
│   │   │   └── ...
│   │   └── register-commands.test.js
│   └── integration/
│       └── commands-integration.test.js
├── package.json
├── README.md
└── LICENSE
```

#### Objective 3: Extract Commands
**Total Commands:** ~40 commands across 5 categories

**Extraction Steps:**
1. Copy all commands to new module structure
2. Update import paths for new module location
3. Ensure all dependencies available
4. Verify command options compatibility
5. Test each command individually

#### Objective 4: Git Submodule Integration
```bash
# In main repository
git submodule add https://github.com/Rarsus/verabot-commands.git repos/verabot-commands

# Configure in .gitmodules
[submodule "repos/verabot-commands"]
    path = repos/verabot-commands
    url = https://github.com/Rarsus/verabot-commands.git
    branch = main
```

#### Objective 5: Verify Functionality
- [ ] Commands module loads without errors
- [ ] All 40+ commands register correctly
- [ ] Discord slash commands work
- [ ] Legacy prefix commands work
- [ ] Command help system works
- [ ] Error handling works
- [ ] All tests passing (100%)

#### Objective 6: Documentation & Training
- [ ] Create Commands Module Setup Guide
- [ ] Update team on new structure
- [ ] Update copilot-instructions (already done for Phase 2.5 reference)
- [ ] Create team training materials
- [ ] Document extraction process for future reference

### Phase 2.5 Success Criteria

- ✅ Commands repository created on GitHub
- ✅ All 40+ commands extracted to module
- ✅ Commands module structure defined
- ✅ Git submodule properly integrated
- ✅ Command registration verified working
- ✅ All commands functional (no regressions)
- ✅ Tests passing (100% pass rate maintained)
- ✅ Documentation complete
- ✅ Team trained on new structure

### Phase 2.5 Dependencies

**Must Complete Before Phase 2.5:**
- ✅ Phase 2 (Git Submodule Setup) - COMPLETE
- ✅ Copilot instructions updated with submodule awareness
- ✅ Team trained on submodule workflows
- ✅ CI/CD infrastructure ready

**Phase 2.5 Enables:**
- Phase 3 (Full Repository Separation)
- Independent command plugin system
- Modular command distribution
- Coordinated command versioning

---

## Implementation Roadmap

### Timeline

```
Week 1 (Jan 21-25, 2026)
└─ Phase 2.5 Planning & Preparation
   ├─ Finalize command extraction plan
   ├─ Create commands repository
   └─ Prepare team for extraction

Week 2 (Jan 26-Feb 1, 2026)
└─ Phase 2.5 Implementation
   ├─ Extract commands to module
   ├─ Integration & testing
   └─ Documentation & training

Week 3+ (Feb 2+, 2026)
└─ Phase 2.5 Verification
   ├─ Monitor new structure
   ├─ Optimize workflows
   └─ Plan Phase 3
```

### Phase 2.5 Implementation Steps

**Step 1: Repository Setup (30 minutes)**
```bash
# Create repository on GitHub
# Initialize with README, LICENSE, .gitignore

# Clone locally
git clone https://github.com/Rarsus/verabot-commands.git
cd verabot-commands

# Set up initial structure
mkdir -p src/commands/{misc,quote-discovery,quote-management,quote-social,quote-export}
mkdir -p tests/{unit,integration}

# Create initial files
touch src/index.js src/register-commands.js
```

**Step 2: Extract Commands (4-6 hours)**
```bash
# Copy commands from verabot-core
cp -r ../verabot2.0/repos/verabot-core/src/commands/* src/commands/

# Update import paths
# Review and test each command

# Ensure all dependencies available
npm install
```

**Step 3: Integration (3-4 hours)**
```bash
# In main repository
git submodule add https://github.com/Rarsus/verabot-commands.git repos/verabot-commands

# Update main bot to load commands from new module
# Test full command loading sequence

# Run full test suite
npm test
```

**Step 4: Documentation (2-3 hours)**
```bash
# Create COMMANDS-MODULE-SETUP-GUIDE.md
# Update copilot-instructions (partially done - add Phase 2.5 confirmation)
# Create team training materials
# Document extraction changes
```

**Step 5: Verification (1-2 hours)**
```bash
# Run all tests
npm test

# Verify all commands work in Discord
# Check performance implications

# Team training & sign-off
```

### Parallel Work Opportunities

While Phase 2.5 commands extraction happens:
- [ ] Plan Phase 3 CI/CD pipeline changes
- [ ] Design npm package distribution strategy
- [ ] Prepare deployment scripts for Phase 3
- [ ] Update docker-compose for new module

---

## Team Workflows

### For Command Development (After Phase 2.5)

**Creating a New Command:**
```bash
# 1. Navigate to commands module
cd repos/verabot-commands

# 2. Determine category
# Use decision tree or reference COMMANDS-MODULE-SETUP-GUIDE.md

# 3. Create command file
touch src/commands/[category]/[command-name].js

# 4. Write tests FIRST (TDD)
cat > tests/unit/commands/[category]/[command-name].test.js << 'EOF'
// RED phase: Write failing tests
EOF

# 5. Implement command to pass tests
# 6. Update command registration

# 7. Test in Discord
# 8. Commit to verabot-commands submodule
```

**For Non-Command Development:**

```bash
# Utility code
cd repos/verabot-utils

# Core bot code
cd repos/verabot-core

# Dashboard code
cd repos/verabot-dashboard

# Same TDD workflow applies to all
```

### For Copilot Development

**Before Creating Any Code:**
1. ✅ Identify code type using responsibility mapping
2. ✅ Verify correct submodule location
3. ✅ Navigate to correct directory
4. ✅ Reference copilot-instructions for patterns
5. ✅ Write tests in same submodule

**Example Flow:**

```
User: "Create a new quote-search command"

Copilot Internal Flow:
1. Check: Is this a command? YES
2. Check: Commands go in? repos/verabot-commands (Phase 2.5+)
3. Check: Currently in? [Current working directory]
4. If not in correct module:
   - Suggest: "This command should be in repos/verabot-commands"
   - If phase 2.5 not done: "Until Phase 2.5, use repos/verabot-core/src/commands"
5. Follow TDD: Write tests first
6. Implement: Make tests pass
7. Verify: Command works in Discord
```

---

## Future Phases Consideration

### Phase 3: Full Repository Separation

**How Phase 2.5 Commands Module Affects Phase 3:**

1. **Four Submodules Instead of Three**
   ```
   Phase 2 Created:  3 submodules
   Phase 2.5 Adds:   4 submodules
   Phase 3 Scales:   4+ submodules with independent CI/CD
   ```

2. **Enhanced Module Independence**
   - Commands can be versioned independently
   - Commands can have own release cycle
   - Commands can be published as package

3. **CI/CD Pipeline Changes**
   ```
   Phase 2: One pipeline monitors 3 submodules
   Phase 3: 4 independent pipelines + orchestration
   ```

4. **Deployment Flexibility**
   - Deploy commands without core rebuild
   - Deploy updates without full restart
   - A/B test command versions

### Phase 3 Planning Adjustments

**Include in Phase 3 Planning:**
- ✅ Four submodule orchestration
- ✅ Commands module release coordination
- ✅ Multi-module CI/CD integration
- ✅ Cross-module dependency management
- ✅ Shared utils version compatibility

### Future Module Possibilities (Phase 4+)

Once Phase 2.5 stabilizes:
- **Additional Modules to Consider:**
  - `repos/verabot-events/` - Event handlers
  - `repos/verabot-services/` - Domain services
  - `repos/verabot-plugins/` - Plugin system
  - `repos/verabot-integrations/` - External integrations

---

## Rollback Plan

If Phase 2.5 encounters issues:

### Quick Rollback Procedure

```bash
# If commands module submodule fails
git rm -rf repos/verabot-commands
git config --file=.gitmodules --remove-section submodule.repos/verabot-commands
git add .gitmodules
git commit -m "revert: remove verabot-commands submodule"

# Commands remain in verabot-core until next Phase 2.5 attempt
```

### Monitoring During Phase 2.5

- ✅ Real-time Discord command testing
- ✅ Continuous test monitoring (npm test)
- ✅ Performance monitoring
- ✅ Error rate tracking
- ✅ User feedback monitoring

---

## Summary

### Current State (Post-Phase 2)
- ✅ Three Git submodules established and verified
- ✅ Copilot instructions updated with submodule awareness
- ✅ Team trained on submodule workflows
- ✅ Production infrastructure ready

### Phase 2.5 Readiness
- ✅ Plan documented and detailed
- ✅ Timeline established (3-4 days)
- ✅ Success criteria defined
- ✅ Team ready to proceed
- ✅ Risk mitigation strategies in place

### Future Phases
- ✅ Phase 3 planning adjusted for 4 modules
- ✅ Scalability considerations documented
- ✅ Growth path identified for future modules
- ✅ Flexibility maintained for enhancements

---

## Contact & Support

For questions about:
- **Submodule structure:** See SUBMODULE-SETUP-GUIDE.md
- **Code placement:** Reference this document's Code Placement Guidelines
- **Phase 2.5 status:** Check GitHub Issue #106
- **Copilot behavior:** Review .github/copilot-instructions.md

---

**Document Created:** January 21, 2026  
**Status:** ✅ Ready for Implementation  
**Next Review:** After Phase 2.5 Completion  
**Owner:** Technical Leadership & Copilot  
