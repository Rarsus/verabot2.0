# Epic #49: Project Restructuring for Independent Sub-Products

**Status:** Planning  
**Priority:** High  
**Target Timeline:** 20-27 days (with 1-2 contributors)  
**Phase 1 Duration:** 6-9 days (Extract to folders)
**Phase 2 Duration:** 2-3 days (Convert to submodules)
**Phase 3 Duration:** 11-16 days (Integration & CI/CD)
**Phase 4 Duration:** 3-5 days (Fully separate - Future)  
**Created:** January 20, 2026

---

## 📋 Executive Summary

Refactor VeraBot2.0 from a monolithic repository into a modular architecture with independent sub-repositories. This enables:
- 🎯 Independent development of sub-products (Dashboard, Core Bot, Plugins)
- 📦 Reusable shared utilities as npm packages
- 🔧 Separate CI/CD pipelines and deployment workflows
- 👥 Better team collaboration across different sub-products
- 🚀 Easier plugin ecosystem expansion

---

## 🏗️ Current Architecture Analysis

### Current Structure
```
verabot2.0/
├── src/
│   ├── commands/           # Discord bot commands
│   ├── core/               # Core bot functionality
│   ├── middleware/         # Request/event handlers
│   ├── routes/
│   │   └── dashboard.js    # 🎯 EXTRACT: Dashboard backend
│   ├── services/           # Business logic
│   ├── config/             # Configuration
│   ├── lib/                # Utilities
│   └── utils/              # Helper functions
├── tests/                  # Test suites
├── docs/                   # Documentation
└── package.json
```

### Identified Sub-Products

#### 1️⃣ **Core Bot (`verabot-core`)**
- Current: `src/commands/`, `src/core/`, `src/middleware/`, `src/index.js`
- Responsibilities: Discord bot logic, slash commands, event handlers
- Status: Keep in main repository (rename to verabot-core)

#### 2️⃣ **Dashboard (`verabot-dashboard`)**
- Current: `src/routes/dashboard.js`, dashboard-related code
- Responsibilities: Web UI, OAuth, admin interface
- Status: Extract to separate repository
- Dependencies: Core bot APIs, shared utilities

#### 3️⃣ **Shared Utilities (`verabot-utils`)**
- Current: `src/lib/`, `src/utils/`, `src/services/`
- Responsibilities: Database services, logging, validation, API helpers
- Status: Extract to separate npm package
- Can be used by: core bot, dashboard, future plugins

#### 4️⃣ **Plugin System** (Future)
- Responsibilities: Allow third-party extensions
- Will depend on: verabot-core, verabot-utils

---

## 🏗️ Phase Breakdown

### Phase 1: Keep as Folders (6-9 days)
**Issues:** #50, #51, #52

Extract code into folder structures while keeping everything in a single repository. This allows for thorough testing and validation before moving to submodules.

### Phase 2: Convert to Git Submodules (2-3 days)
**Issue:** #98

After Phase 1 extraction is complete, convert the folders to independent Git submodules. This enables separate versioning and preparation for future full separation.

### Phase 3: Integration & CI/CD (11-16 days)
**Issues:** #53, #54, #55, #56

Test the submodule structure thoroughly, refactor the core bot repository, setup independent CI/CD pipelines for each submodule, and finalize documentation.

### Phase 4: Fully Separate Repositories (Future, 3-5 days)
**Issues:** TBD

Create fully independent repositories with separate GitHub repos, issue tracking, and independent npm packages.

---

## 📋 Phase 1: Keep as Folders (6-9 days)

**Phase 1: Planning & Preparation**

#### ✅ Sub-Issue #50: Plan and Define Modular Boundaries
**Duration:** 2-3 days  
**Artifacts:** Architecture documentation, dependency graph

**Tasks:**
1. **Analyze Current Codebase**
   - [ ] Map all modules and their dependencies
   - [ ] Identify circular dependencies
   - [ ] Document data flows
   - [ ] Create dependency graph (circular, internal, external)

2. **Define Module Boundaries**
   - [ ] Core Bot: Discord.js, commands, events, middleware
   - [ ] Dashboard: Express routes, OAuth, admin endpoints
   - [ ] Utilities: Services, helpers, database, logging
   - [ ] Shared Types: Interfaces and type definitions

3. **Document Dependencies**
   - [ ] Core Bot dependencies on Utilities
   - [ ] Dashboard dependencies on Core & Utilities
   - [ ] External dependencies for each module
   - [ ] Version constraints for shared packages

4. **Create Architecture Document**
   - [ ] Diagram showing module relationships
   - [ ] API contracts between modules
   - [ ] Data flow diagrams
   - [ ] Migration checklist

**Success Criteria:**
- ✅ All modules identified and documented
- ✅ Zero circular dependencies between sub-repos
- ✅ Clear API contracts defined
- ✅ Team consensus on boundaries

---

### Phase 2: Shared Utilities Extraction

#### ✅ Sub-Issue #52: Create Shared Utilities Repository
**Duration:** 3-4 days  
**Artifacts:** `verabot-utils` npm package

**Tasks:**
1. **Create New Repository**
   - [ ] Create `verabot-utils` repository
   - [ ] Setup package.json, tsconfig, ESLint, Jest
   - [ ] Initialize git with proper structure
   - [ ] Add LICENSE, README, CONTRIBUTING

2. **Extract Utilities**
   - [ ] Move `src/services/DatabaseService.js` → `lib/services/`
   - [ ] Move `src/services/ValidationService.js` → `lib/services/`
   - [ ] Move `src/lib/error-handler.js` → `lib/middleware/`
   - [ ] Move `src/utils/helpers/` → `lib/utils/`
   - [ ] Move database schemas and migrations
   - [ ] Move type definitions

3. **Create Shared Types**
   - [ ] Define and export TypeScript interfaces
   - [ ] Create `types/index.d.ts` for type definitions
   - [ ] Document all exported types

4. **Setup Publishing**
   - [ ] Configure npm publishing
   - [ ] Setup semantic versioning
   - [ ] Create GitHub Actions for publishing
   - [ ] Add automated changelog

5. **Testing & Validation**
   - [ ] All utilities have test coverage (>85%)
   - [ ] Import paths updated in utilities
   - [ ] Documentation for each utility
   - [ ] Example usage in README

**Success Criteria:**
- ✅ `verabot-utils` published to npm
- ✅ All utilities properly exported
- ✅ Tests passing (>85% coverage)
- ✅ Documentation complete
- ✅ Version 1.0.0 released

**Dependencies:** Sub-Issue #50

---

### Phase 3: Dashboard Extraction

#### ✅ Sub-Issue #51: Create New Repository for Dashboard
**Duration:** 4-5 days  
**Artifacts:** `verabot-dashboard` repository

**Tasks:**
1. **Create Repository**
   - [ ] Create `verabot-dashboard` repository
   - [ ] Setup Express.js, React (if applicable)
   - [ ] Configure build tools (Webpack, TypeScript)
   - [ ] Setup testing framework (Jest, React Testing Library)
   - [ ] Add production deployment config

2. **Extract Dashboard Code**
   - [ ] Move `src/routes/dashboard.js` to new repo
   - [ ] Extract OAuth configuration
   - [ ] Extract admin endpoints
   - [ ] Extract any associated middleware
   - [ ] Move dashboard tests

3. **Refactor Dependencies**
   - [ ] Remove core bot dependencies (except shared utilities)
   - [ ] Update imports to use `verabot-utils`
   - [ ] Replace direct service calls with API calls to core bot
   - [ ] Create environment configuration for core bot URLs

4. **Setup Communication Layer**
   - [ ] Define REST API contracts with core bot
   - [ ] Create API client for core bot communication
   - [ ] Setup error handling for inter-service communication
   - [ ] Add retry logic and timeouts

5. **Testing**
   - [ ] Unit tests for all dashboard routes
   - [ ] Integration tests with mock core bot API
   - [ ] End-to-end testing with real core bot
   - [ ] Load testing for concurrent users

6. **Documentation & Deployment**
   - [ ] README with setup instructions
   - [ ] API documentation (OpenAPI/Swagger)
   - [ ] Deployment guide (Docker, Heroku, etc.)
   - [ ] Environment variables documentation

**Success Criteria:**
- ✅ Dashboard runs independently
- ✅ All routes tested and working
- ✅ API communication with core bot stable
- ✅ Deployable as standalone service
- ✅ Documentation complete

**Dependencies:** Sub-Issue #50, #52

---

## 📋 Phase 2: Convert to Git Submodules (2-3 days)

See **Issue #98** for detailed implementation steps.

Key activities:
- Create independent GitHub repositories for each sub-repo
- Initialize independent Git histories
- Configure main repo with `.gitmodules`
- Update Docker Compose to work with submodules
- Document submodule development workflow

---

## 📋 Phase 3: Integration & CI/CD (11-16 days)

### Phase 3: Main Repository Refactoring

#### ✅ Sub-Issue #54: Refactor Parent Repository
**Duration:** 2-3 days (Phase 3)

**Tasks:**
1. **Code Cleanup**
   - [ ] Remove extracted dashboard code
   - [ ] Remove extracted utilities
   - [ ] Eliminate unused imports
   - [ ] Update remaining code to use `verabot-utils` package

2. **Update Dependencies**
   - [ ] Add `verabot-utils` as npm dependency
   - [ ] Remove now-external service code
   - [ ] Update `package.json` with correct versions
   - [ ] Run `npm audit` to check for vulnerabilities

3. **Update Imports**
   - [ ] Replace all imports of extracted utilities
   - [ ] Update relative paths to package imports
   - [ ] Fix any circular dependency issues
   - [ ] Verify all imports resolve correctly

4. **Refactor Core Bot Logic**
   - [ ] Separate discord bot from HTTP server (if combined)
   - [ ] Move dashboard routes to their own service
   - [ ] Update middleware to work with new structure
   - [ ] Create clear entry points for core bot

5. **Testing**
   - [ ] Run all existing tests
   - [ ] Update test imports
   - [ ] Add integration tests for utilities usage
   - [ ] Verify bot still functions correctly

**Success Criteria:**
- ✅ All tests passing
- ✅ No circular dependencies
- ✅ Correct package imports used
- ✅ Documentation updated
- ✅ Ready for release

**Dependencies:** Sub-Issue #50, #51, #52

---

### Phase 5: Integration & CI/CD

#### ✅ Sub-Issue #53: Integrate Sub-Repositories
**Duration:** 4-6 days (Phase 3)  
**Artifacts:** Integration layer, API contracts
**Timing:** After Phase 2 (submodule conversion)

**Tasks:**
1. **Define API Contracts**
   - [ ] Document Core Bot → Dashboard APIs
   - [ ] Document Utilities → All modules
   - [ ] Define error codes and responses
   - [ ] Version the APIs

2. **Setup Service Discovery**
   - [ ] Environment variables for service URLs
   - [ ] Configuration management
   - [ ] Health check endpoints
   - [ ] Graceful degradation strategies

3. **Implementation Patterns**
   - [ ] Create API client library (in utilities)
   - [ ] Implement retry logic with exponential backoff
   - [ ] Add request/response logging
   - [ ] Setup monitoring and alerting

4. **Local Development Setup**
   - [ ] Docker Compose for local stack
   - [ ] Scripts to start all services
   - [ ] Shared environment file
   - [ ] Development seed data

5. **Testing Integration**
   - [ ] Mock service tests
   - [ ] Real service integration tests
   - [ ] End-to-end workflow tests
   - [ ] Performance tests

**Success Criteria:**
- ✅ All services communicate correctly
- ✅ Integration tests passing
- ✅ Docker Compose setup working
- ✅ Development workflow documented

**Dependencies:** Sub-Issue #50, #51, #52, #54

#### ✅ Sub-Issue #55: Implement Separate CI/CD Pipelines
**Duration:** 3-4 days  
**Artifacts:** GitHub Actions workflows, deployment scripts

**Tasks:**
1. **Core Bot Workflow** (`verabot-core`)
   - [ ] Lint and test on push
   - [ ] Build Docker image on tag
   - [ ] Push to Docker Hub
   - [ ] Deploy to production

2. **Dashboard Workflow** (`verabot-dashboard`)
   - [ ] Lint and test on push
   - [ ] Build frontend and backend
   - [ ] Create Docker image
   - [ ] Deploy to production

3. **Utilities Workflow** (`verabot-utils`)
   - [ ] Lint and test on push
   - [ ] Run npm audit
   - [ ] Build distribution files
   - [ ] Publish to npm on tag

4. **Integration Tests**
   - [ ] Deploy services to staging
   - [ ] Run end-to-end tests
   - [ ] Smoke tests
   - [ ] Rollback on failure

5. **Monitoring & Alerts**
   - [ ] Health check endpoints
   - [ ] Deployment notifications
   - [ ] Error tracking (Sentry)
   - [ ] Performance monitoring

**Success Criteria:**
- ✅ All workflows automated
- ✅ Deployments work correctly
- ✅ Rollback procedures tested
- ✅ Team trained on CI/CD

**Dependencies:** Sub-Issue #51, #52, #54, #53

---

### Phase 6: Documentation

#### ✅ Sub-Issue #56: Document the Changes
**Duration:** 2 days (Phase 3)  
**Artifacts:** Updated documentation
**Timing:** After Phase 2 (submodule conversion)

**Tasks:**
1. **Architecture Documentation**
   - [ ] Update ARCHITECTURE.md with new structure
   - [ ] Create module diagrams
   - [ ] Document API contracts
   - [ ] Add sequence diagrams

2. **Developer Guides**
   - [ ] Setup guide for each sub-repo
   - [ ] Local development with Docker Compose
   - [ ] How to add new commands
   - [ ] How to create a plugin

3. **Deployment Documentation**
   - [ ] Production deployment guide
   - [ ] Environment configuration
   - [ ] Scaling considerations
   - [ ] Troubleshooting guide

4. **API Documentation**
   - [ ] Core Bot API endpoints
   - [ ] Dashboard endpoints
   - [ ] Utilities API reference
   - [ ] Request/response examples

5. **Migration Guide**
   - [ ] For existing developers
   - [ ] New workflow for contributors
   - [ ] IDE/tool setup
   - [ ] Common troubleshooting

**Success Criteria:**
- ✅ All documentation updated
- ✅ New developers can follow setup guide
- ✅ All APIs documented
- ✅ Examples provided for common tasks

**Dependencies:** All other sub-issues

---

## 🎯 Success Criteria & Validation

### Functional Requirements
- [ ] Core bot functions identically to before refactoring
- [ ] Dashboard works independently from core bot
- [ ] Utilities are reusable across all modules
- [ ] Zero breaking changes for end users

### Performance Requirements
- [ ] No performance degradation
- [ ] Service startup time < 10 seconds
- [ ] API response times < 500ms
- [ ] Memory usage stable or improved

### Code Quality Requirements
- [ ] Test coverage ≥ 85% (each module)
- [ ] Zero ESLint errors
- [ ] No circular dependencies
- [ ] All TypeScript types properly defined

### Operational Requirements
- [ ] Independent deployments work correctly
- [ ] Monitoring and alerting in place
- [ ] Rollback procedures tested
- [ ] Team trained on new structure

---

## 📅 Execution Timeline

```
Week 1:
  ├─ Days 1-3: Sub-Issue #50 (Planning)
  ├─ Days 2-5: Sub-Issue #52 (Utilities) [parallel start]
  └─ Days 3-5: Sub-Issue #51 (Dashboard) [parallel start]

Week 2:
  ├─ Days 6-7: Sub-Issue #54 (Core Bot refactoring)
  ├─ Days 7-10: Sub-Issue #53 (Integration)
  └─ Days 8-11: Sub-Issue #55 (CI/CD)

Week 3:
  ├─ Days 12-13: Sub-Issue #56 (Documentation)
  ├─ Days 13-14: Testing & QA
  └─ Day 15: Release & Communication
```

**Total Duration:** 15-27 days (depends on complexity)

---

## 🚀 Implementation Recommendations

### Approach: Gradual Migration

**Phase A - Foundation (Days 1-3)**
- Plan boundaries ✅
- Extract utilities
- Setup infrastructure

**Phase B - Extraction (Days 4-8)**
- Extract dashboard
- Refactor core bot
- Setup integration layer

**Phase C - Stabilization (Days 9-15)**
- CI/CD pipelines
- Documentation
- Testing & validation

**Phase D - Deployment (Days 16-27)**
- Production deployment
- Monitoring
- Team training

### Key Decisions to Make

1. **Package Management for Utilities**
   - [ ] npm package (recommended)
   - [ ] Git submodule
   - [ ] Internal monorepo

2. **Inter-Service Communication**
   - [ ] REST API (recommended)
   - [ ] GraphQL
   - [ ] gRPC

3. **Shared Database**
   - [ ] Single shared database
   - [ ] Separate databases with sync
   - [ ] Event-driven architecture

4. **Deployment Strategy**
   - [ ] Docker (recommended)
   - [ ] Docker + Kubernetes
   - [ ] Serverless (Lambda, Cloud Functions)

---

## 🛠️ Tools & Technologies

### Development
- **Language:** JavaScript/TypeScript
- **Testing:** Jest, React Testing Library
- **Linting:** ESLint, Prettier
- **Version Control:** Git, GitHub

### Infrastructure
- **Containerization:** Docker, Docker Compose
- **Deployment:** GitHub Actions, Docker Hub
- **Monitoring:** Sentry, Prometheus, Grafana
- **Logging:** Winston, ELK Stack

### Repository Setup
```bash
# Create repositories
git init verabot-core
git init verabot-dashboard
git init verabot-utils

# npm Setup
npm init -y
npm install eslint jest typescript

# Docker Setup
dockerfile
docker-compose.yml
docker-compose.prod.yml
```

---

## 📝 Documentation Outputs

After completing this epic, we will have:

1. **Architecture Documentation**
   - Module boundaries and responsibilities
   - Dependency graphs
   - API contracts
   - Sequence diagrams

2. **Developer Guides**
   - Local development setup
   - How to add features
   - How to write tests
   - How to contribute

3. **Deployment Guides**
   - Production deployment
   - Environment configuration
   - Scaling and monitoring
   - Disaster recovery

4. **API Documentation**
   - Core Bot API reference
   - Dashboard API reference
   - Utilities library reference
   - Examples and use cases

---

## ⚠️ Risks & Mitigation

### Risk 1: Breaking Changes
**Impact:** High | **Likelihood:** Medium  
**Mitigation:**
- Maintain backward compatibility during transition
- Semantic versioning for utilities package
- Extensive integration testing
- Feature flags for gradual rollout

### Risk 2: Service Communication Failures
**Impact:** High | **Likelihood:** Medium  
**Mitigation:**
- Implement retry logic with exponential backoff
- Circuit breaker pattern
- Comprehensive error handling
- Detailed logging for debugging

### Risk 3: Data Consistency Issues
**Impact:** High | **Likelihood:** Low  
**Mitigation:**
- Shared database or event-driven sync
- Transaction management
- Data migration scripts
- Audit logging

### Risk 4: Team Knowledge Transfer
**Impact:** Medium | **Likelihood:** Medium  
**Mitigation:**
- Comprehensive documentation
- Pair programming sessions
- Video tutorials
- Regular sync meetings

### Risk 5: Increased Complexity
**Impact:** Medium | **Likelihood:** High  
**Mitigation:**
- Start with simple service boundaries
- Use Docker Compose for local development
- Automated testing and deployment
- Clear API contracts

---

## 🔄 After This Epic: Future Possibilities

Once this refactoring is complete:

1. **Plugin System** - Allow community to create plugins
2. **Microservices** - Further break down services (reminders, messaging, etc.)
3. **Mobile App** - Independent mobile client using shared APIs
4. **Admin Dashboard** - Separate admin interface
5. **Analytics Service** - Independent analytics engine
6. **Integration Hub** - Connect to third-party services

---

## 📞 Next Steps

1. **Review this plan** with the team
2. **Adjust sub-issue boundaries** based on feedback
3. **Create GitHub issues** for each sub-issue (#50-#56)
4. **Assign team members** to each phase
5. **Schedule kickoff meeting** to discuss approach
6. **Begin Sub-Issue #50** (Planning & Boundaries)

---

**Document Version:** 1.0  
**Last Updated:** January 20, 2026  
**Status:** Ready for Review
