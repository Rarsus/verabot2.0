# Epic #49 Repository Separation - Complete Implementation Guide

**Epic**: #49 - Repository Separation  
**Status**: Phase 1 - Infrastructure Ready  
**Date**: January 20, 2026  
**Total Timeline**: 20-27 days (three phases)

---

## 🎯 Quick Overview

Epic #49 refactors Verabot into independent sub-repositories through a **4-phase approach**:

| Phase | Timeline | Approach | Status |
|-------|----------|----------|--------|
| **Phase 1** | 6-9 days | Keep as folders | 🟢 Ready (Issues #50-#52) |
| **Phase 2** | 2-3 days | Convert to Git submodules | 🟡 Planned (Issue #98) |
| **Phase 3** | 11-16 days | Integration & CI/CD | 🟡 Planned (Issues #53-#56) |
| **Phase 4** | 3-5 days | Fully separate repos | 🔵 Future |

---

## 📋 Issues & Timeline

### Phase 1: Extraction & Integration (Days 1-9)

| Issue | Title | Duration | Status |
|-------|-------|----------|--------|
| #50 | Plan module boundaries | 2-3 days | Ready |
| #51 | Extract dashboard to folder | 4-5 days | Ready |
| #52 | Extract utilities to folder | 3-4 days | Ready |

**Phase 1 Deliverables:**
- ✅ Module boundaries clearly defined
- ✅ Dashboard extracted and tested
- ✅ Utilities extracted as reusable package
- ✅ Code compiles and runs in folder structure
- ✅ Basic integration testing passes

### Phase 2: Git Submodule Conversion (Days 10-12) ⏭️

| Issue | Title | Duration | Status |
|-------|-------|----------|--------|
| #98 | Convert to Git submodules | 2-3 days | Created |

**Phase 2 Deliverables:**
- Independent GitHub repositories created
- Folders converted to Git submodules
- Documentation updated
- Docker Compose tested with submodules

### Phase 3: Integration & CI/CD (Days 13-28) 🔄

| Issue | Title | Duration | Status |
|-------|-------|----------|--------|
| #53 | Integration testing | 4-6 days | Ready |
| #54 | Refactor core bot | 2-3 days | Ready |
| #55 | CI/CD pipelines | 3-4 days | Ready |
| #56 | Documentation | 2 days | Ready |

**Phase 3 Deliverables:**
- Core bot refactored to repo structure
- Full integration testing complete
- Independent CI/CD for each submodule
- Comprehensive documentation
- All tests passing (3000+)

### Phase 4: Full Separation (Future) 🔮

**Not yet issued - to be created after Phase 3**

**Phase 4 Deliverables:**
- Fully independent repositories
- Separate issue tracking
- Independent CI/CD pipelines
- npm package publishing
- External contribution workflows

---

## 🏗️ What We've Created

### Infrastructure Files

**Docker Compose** (Local & Production):
- ✅ `DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml` - Dev environment with all 5 services
- ✅ `DOCKER-COMPOSE-PRODUCTION.yml` - Production with PostgreSQL, nginx, monitoring
- ✅ `.env.example.docker` - Environment template

**Repository Structures**:
- ✅ `repos/verabot-core/` - Core bot service
- ✅ `repos/verabot-dashboard/` - Web dashboard
- ✅ `repos/verabot-utils/` - Shared utilities (npm package)

Each with:
- `README.md` - Complete setup & development guide
- `package.json` - Dependencies and scripts
- `Dockerfile` - Production build
- `Dockerfile.dev` - Development build
- `.gitignore` - Git ignore patterns

### Documentation

- ✅ `EPIC-49-IMPLEMENTATION-PLAN.md` - Detailed implementation roadmap
- ✅ `EPIC-49-INFRASTRUCTURE-SETUP-SUMMARY.md` - Infrastructure artifacts summary
- ✅ `EPIC-49-PHASE-BASED-STRATEGY.md` - Three-phase strategy explanation
- ✅ This guide (`EPIC-49-COMPLETE-IMPLEMENTATION-GUIDE.md`)

---

## 🚀 How to Proceed

### For Phase 1 (Next 1-2 weeks)

**Start with Issue #50:**
```bash
# Begin work on module boundary definition
git checkout -b feature/epic-49-phase1

# Work through issues in order:
# 1. #50 - Define boundaries (review created structures)
# 2. #51 - Extract dashboard code
# 3. #52 - Extract utilities code
```

**Test with Docker Compose:**
```bash
docker-compose -f DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml up
# Access: http://localhost:8080 (dashboard)
```

### For Phase 2 (After Phase 1)

**Start with Issue #98:**
```bash
# 1. Create GitHub repositories for each sub-repo
# 2. Initialize independent Git histories
# 3. Convert folders to Git submodules
# 4. Update documentation
# 5. Test with Docker Compose
# 6. Validate submodule workflow
```

### For Phase 3 (After Phase 2)

**Start with Issue #53:**
```bash
# 1. Test inter-repository communication
# 2. Validate Docker Compose with submodules
# 3. Refactor core bot repo (Issue #54)
# 4. Setup independent CI/CD pipelines (Issue #55)
# 5. Finalize documentation (Issue #56)
```

### For Phase 4 (Future)

**Create new issue(s) for:**
- Create fully independent npm packages
- Setup separate GitHub repositories (no submodules)
- Independent issue tracking and project boards
- Independent CI/CD pipelines
- External contribution guidelines

---

## 📊 Architecture Diagram

```
verabot2.0 (Main Repository)
│
├── src/                          (Core bot logic)
│   ├── commands/
│   ├── services/
│   ├── middleware/
│   └── utils/
│
├── repos/                        (Sub-repositories)
│   │
│   ├── verabot-core/            (Phase 1: Folder → Phase 2: Submodule)
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── verabot-dashboard/       (Phase 1: Folder → Phase 2: Submodule)
│   │   ├── src/
│   │   ├── public/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── verabot-utils/           (Phase 1: Folder → Phase 2: Submodule)
│       ├── src/
│       │   ├── services/
│       │   ├── middleware/
│       │   └── helpers/
│       ├── tests/
│       └── package.json
│
├── DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml
├── DOCKER-COMPOSE-PRODUCTION.yml
├── .env.example.docker
├── EPIC-49-IMPLEMENTATION-PLAN.md
├── EPIC-49-INFRASTRUCTURE-SETUP-SUMMARY.md
└── EPIC-49-PHASE-BASED-STRATEGY.md
```

---

## 🔄 Development Workflow

### Phase 1: Working in Folders

```bash
# Clone main repo (contains all folders)
git clone https://github.com/Rarsus/verabot2.0.git
cd verabot2.0

# Develop in any sub-repo
cd repos/verabot-core
npm install
npm run dev

# Commit to main repo
git add repos/verabot-core/
git commit -m "feat: add new command"
git push origin main
```

### Phase 2: Working with Submodules

```bash
# Clone with submodules
git clone --recursive https://github.com/Rarsus/verabot2.0.git
cd verabot2.0

# Develop in sub-repo (independent Git history)
cd repos/verabot-core
git checkout -b feature/my-feature
npm install
npm run dev

# Commit independently
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature

# Update submodule reference in main
cd ../..
git add repos/verabot-core
git commit -m "chore: update verabot-core"
git push origin main
```

### Phase 3: Fully Independent

```bash
# Clone and develop completely separately
git clone https://github.com/Rarsus/verabot-core.git
cd verabot-core
npm install
npm run dev

# No coordination with main repo needed
# Each repo maintains independent release cycle
```

---

## 📝 Key Commands

### Docker Compose

```bash
# Local development
docker-compose -f DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml up

# Production
docker-compose -f DOCKER-COMPOSE-PRODUCTION.yml up -d

# Rebuild services
docker-compose -f DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml build

# Stop services
docker-compose -f DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml down
```

### Testing

```bash
# All services
npm test

# Specific service
cd repos/verabot-core && npm test
cd repos/verabot-dashboard && npm test
cd repos/verabot-utils && npm test

# With coverage
npm test -- --coverage
```

### Git (Phase 2+)

```bash
# Clone with submodules
git clone --recursive https://github.com/Rarsus/verabot2.0.git

# Initialize submodules if not cloned recursively
git submodule update --init --recursive

# Update all submodules to latest
git submodule update --remote --merge

# Push changes in submodule
cd repos/verabot-core
git push origin feature-branch
```

---

## ✅ Success Criteria by Phase

### Phase 1 Success
- ✅ All 7 sub-issues (#50-#56) closed
- ✅ Code extracted and tested
- ✅ 100% test pass rate maintained (3000+)
- ✅ Docker Compose works perfectly
- ✅ Documentation complete
- ✅ Team consensus on boundaries
- ✅ Ready to convert to submodules

### Phase 2 Success
- ✅ Issue #98 closed
- ✅ Independent Git repos created on GitHub
- ✅ Submodules configured in main repo
- ✅ `git clone --recursive` works for new developers
- ✅ Docker Compose compatible with submodules
- ✅ CI/CD updated for submodule support
- ✅ Submodule workflow documented
- ✅ Team trained on new workflow

### Phase 3 Success (Future)
- ✅ Fully independent repositories
- ✅ Separate issue tracking per repo
- ✅ Independent release cycles
- ✅ npm packages published
- ✅ External contributors enabled
- ✅ Independent CI/CD pipelines

---

## 🛠️ Tools & Technologies

**Version Control:**
- Git (for Phase 1 in single repo)
- Git Submodules (Phase 2)
- GitHub (repositories)

**Containerization:**
- Docker (container images)
- Docker Compose (orchestration)

**Development:**
- Node.js 20+
- npm 10+

**CI/CD:**
- GitHub Actions (testing, deployment)
- Semantic Release (versioning)

---

## 📚 Related Documentation

**Created for this Epic:**
- [EPIC-49-IMPLEMENTATION-PLAN.md](EPIC-49-IMPLEMENTATION-PLAN.md)
- [EPIC-49-INFRASTRUCTURE-SETUP-SUMMARY.md](EPIC-49-INFRASTRUCTURE-SETUP-SUMMARY.md)
- [EPIC-49-PHASE-BASED-STRATEGY.md](EPIC-49-PHASE-BASED-STRATEGY.md)

**In Repository READMEs:**
- [repos/verabot-core/README.md](repos/verabot-core/README.md)
- [repos/verabot-dashboard/README.md](repos/verabot-dashboard/README.md)
- [repos/verabot-utils/README.md](repos/verabot-utils/README.md)

**Parent Documentation:**
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [DEFINITION-OF-DONE.md](DEFINITION-OF-DONE.md)
- [docs/INDEX.md](docs/INDEX.md)

---

## 🤝 Getting Help

### For Phase 1 Work (#50-#56)

1. **Review Created Structures**: Check `repos/` directories
2. **Read Implementation Plan**: See [EPIC-49-IMPLEMENTATION-PLAN.md](EPIC-49-IMPLEMENTATION-PLAN.md)
3. **Check Docker Compose**: Test with `docker-compose -f DOCKER-COMPOSE-LOCAL-DEVELOPMENT.yml up`
4. **Review READMEs**: Each repo has setup instructions

### For Phase 2 Work (#98)

1. **Review Strategy**: See [EPIC-49-PHASE-BASED-STRATEGY.md](EPIC-49-PHASE-BASED-STRATEGY.md)
2. **Read Issue #98**: Complete instructions for submodule conversion
3. **Create GitHub Repos**: Use provided checklist
4. **Update Documentation**: Follow provided templates

---

## 📞 Contact & Support

For questions about:
- **Phase 1 work**: Check issue #50-#56 descriptions
- **Phase 2 work**: Check issue #98 description
- **Infrastructure**: Review created Docker Compose files
- **Development**: See individual repository READMEs

---

**Version**: 1.0  
**Status**: Phase 1 Ready - Awaiting Implementation  
**Created**: January 20, 2026  
**Epic**: #49 - Repository Separation
