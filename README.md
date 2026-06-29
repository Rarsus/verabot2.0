# VeraBot2.0

![Version](https://img.shields.io/badge/version-v4.9.0-blue)
![Tests](https://img.shields.io/badge/tests-3431%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-baseline-orange)
![Node Version](https://img.shields.io/badge/node-%3E%3D20-green)

Advanced multi-guild Discord bot with quote management, reminders, bi-directional message proxy,
role-based permissions, and a React web dashboard. Built with Discord.js v14, per-guild SQLite
databases, slash + prefix commands, and a layered service architecture.

> **Repository status (June 2026):** The project is being decomposed into npm workspaces
> (`repos/verabot-core`, `repos/verabot-utils`, `repos/verabot-dashboard`,
> `repos/verabot-commands`). At the time of writing, those submodules are declared in
> `.gitmodules` but the directories are empty in this branch — the bot still runs entirely
> from `src/` and `dashboard/` in this repository.

---

## 🚀 Quick Start

### Prerequisites

- Node.js **>= 20.0.0** (CI runs on Node 20 and 22)
- npm **>= 10.0.0**
- A Discord application + bot token

### Installation

```bash
npm install
```

Copy `.env.example` to `.env` and set:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=optional_test_guild_id        # Speeds up guild-scoped command registration
PREFIX=!                               # Prefix for legacy commands (default: !)
HUGGINGFACE_API_KEY=optional_key       # For AI poem generation

# Optional feature flags
ENABLE_REMINDERS=true                  # On by default; set to "false" to disable
ENABLE_PROXY_FEATURES=true             # Off by default
ENABLE_ADMIN_COMMANDS=true             # Off by default
ENABLE_DASHBOARD_API=true              # Off by default; serves API on API_PORT
API_PORT=3000
PROXY_WEBHOOK_PORT=3001
```

Register commands (optional — also auto-runs on `guildCreate`):

```bash
npm run register-commands
```

Start the bot:

```bash
node src/index.js
```

> **Note:** `npm start` currently points to `node index.js`, but the entry point lives at
> `src/index.js`. Use `node src/index.js` directly, or use Docker
> (the Dockerfile already invokes `node src/index.js`).

---

## ✨ Key Features

### 📝 Quote Management

- Add, update, delete, and list quotes with author attribution (per guild)
- Search by text/author, paginated retrieval, statistics
- 1–5 star ratings, tag system, JSON/CSV export

### 🔔 Reminder System

- Create, list, search, get, update, delete reminders
- User & role assignment, scheduled DM/channel notifications
- Notification history and retry logic via `GuildAwareReminderNotificationService`
- Toggle with `ENABLE_REMINDERS` (on by default)

### 💬 Bi-Directional Message Proxy

- Forward Discord messages to external webhooks (`WebhookProxyService`)
- Receive external webhooks and relay into Discord (`WebhookListenerService`)
- HMAC signature verification, encrypted token storage, retry logic
- Admin-only configuration commands; gated by `ENABLE_PROXY_FEATURES`

### 🛡️ Admin Communication

- `broadcast`, `say`, `whisper`, `embed-message` for staff messaging
- `external-action-send`, `external-action-status` for outbound integrations
- Gated by 5-tier `RolePermissionService` and `ENABLE_ADMIN_COMMANDS`

### 👤 User Preferences

- Bot opt-in / opt-out for DM notifications
- Onboarding DM with opt-in button on `guildMemberAdd`
- `comm-status` for users to inspect their preferences

### 🤖 AI Integration

- HuggingFace-based poem generation (`/poem`)

### 🌐 Web Dashboard

- React 19 + Vite SPA (`dashboard/`) with Tailwind CSS
- Separate Express OAuth/API gateway under `dashboard/server/`
- Optional in-bot Express dashboard API mounted via `src/routes/dashboard.js`
  when `ENABLE_DASHBOARD_API=true`

### 🏗️ Modern Architecture

- `CommandBase` with automatic error wrapping and permission checks
- `buildCommandOptions` unifies slash + prefix command option definitions
- Guild-aware service layer (`GuildAwareDatabaseService`, `GuildAwareReminderService`,
  `GuildAwareCommunicationService`) with per-guild SQLite databases via
  `GuildDatabaseManager`
- Centralized error handling middleware
- 5-tier role-based permission system

---

## 🏗️ Project Structure

The repository in its current form (this branch) is a single-package layout. The
submodule directories under `repos/` are declared but empty.

```
verabot2.0/
├── src/
│   ├── index.js                 # Bot entry point (Discord client, event handlers)
│   ├── register-commands.js     # Slash command registration script
│   ├── database.js              # Legacy single-DB quote wrapper (deprecated)
│   ├── config/
│   │   └── features.js          # Feature flag definitions (env-driven)
│   ├── core/
│   │   ├── CommandBase.js       # Base class for all commands
│   │   ├── CommandOptions.js    # Unified slash/prefix option builder
│   │   └── EventBase.js         # Event handler base class
│   ├── lib/
│   │   ├── schema-enhancement.js  # SQLite schema bootstrap
│   │   ├── migration.js
│   │   └── detectReadyEvent.js
│   ├── middleware/
│   │   ├── errorHandler.js      # logError + handleInteractionError + validators
│   │   └── ...
│   ├── routes/
│   │   └── dashboard.js         # In-bot dashboard API (Express)
│   ├── services/
│   │   ├── GuildDatabaseManager.js
│   │   ├── GuildAwareDatabaseService.js
│   │   ├── GuildAwareReminderService.js
│   │   ├── GuildAwareReminderNotificationService.js
│   │   ├── GuildAwareCommunicationService.js
│   │   ├── GlobalProxyConfigService.js
│   │   ├── GlobalUserCommunicationService.js
│   │   ├── QuoteService.js
│   │   ├── DatabaseService.js              # Deprecated wrapper
│   │   ├── DatabaseServiceGuildAwareWrapper.js
│   │   ├── DatabasePool.js
│   │   ├── CacheManager.js
│   │   ├── CommunicationService.js
│   │   ├── DiscordService.js
│   │   ├── ExternalActionHandler.js
│   │   ├── MigrationManager.js
│   │   ├── PerformanceMonitor.js
│   │   ├── ReminderNotificationService.js
│   │   ├── ReminderService.js              # (legacy)
│   │   ├── RolePermissionService.js
│   │   ├── ValidationService.js
│   │   ├── WebSocketService.js
│   │   ├── WebhookListenerService.js
│   │   ├── WebhookProxyService.js
│   │   └── migrations/
│   ├── utils/
│   │   ├── helpers/             # response-helpers, etc.
│   │   └── constants/
│   ├── types/
│   └── commands/
│       ├── misc/                # hi, ping, help, poem
│       ├── admin/               # broadcast, embed-message, external-action-send,
│       │                        # external-action-status, proxy-config, proxy-enable,
│       │                        # proxy-status, say, whisper
│       ├── quote-discovery/     # random-quote, search-quotes, quote-stats
│       ├── quote-management/    # add-quote, delete-quote, list-quotes, quote, update-quote
│       ├── quote-social/        # rate-quote, tag-quote
│       ├── quote-export/        # export-quotes
│       ├── reminder-management/ # create, get, list, search, update, delete reminder
│       └── user-preferences/    # opt-in, opt-in-request, opt-out, comm-status
│
├── dashboard/                   # React 19 + Vite + Tailwind SPA
│   ├── src/                     # Pages (Login, Dashboard), components, services
│   └── server/                  # Express OAuth gateway (separate package)
│
├── data/                        # SQLite databases (per guild) — created at runtime
├── scripts/                     # Coverage, db migrations, link validation, etc.
├── tests/
│   ├── unit/                    # Active Jest unit tests
│   ├── integration/             # Integration tests (incl. submodule compatibility)
│   └── _archive/                # 84 archived legacy test files (not executed)
├── docs/                        # Reorganized documentation tree
├── repos/                       # Submodule placeholders (empty in this branch)
├── .github/workflows/           # CI/CD (8 active workflows)
├── Dockerfile                   # Multi-stage build (node:20-alpine)
└── docker-compose.yml           # Bot (3000) + dashboard (5000) services
```

---

## 🧪 Testing

### Run Tests

```bash
npm test                  # Run the full Jest suite
npm run test:quick        # Silent run (used by CI)
npm run test:coverage     # With coverage report
npm run test:integration  # Integration suite only
npm run test:security     # Security/validation-focused subset
```

### Current Test Status

Measured locally on Node 24 against this branch:

- **79 test suites total** — 78 passing, 1 failing
- **3462 tests total** — 3431 passing, 31 failing
- **All 31 failures** are in
  `tests/integration/test-submodule-migration-compatibility.test.js`, which expects
  populated submodule directories under `repos/`. Those directories are empty in this
  branch, so the suite cannot validate the migration. The failures do not reflect
  bot-code regressions.
- Coverage thresholds in `jest.config.js` are intentionally low (lines/statements 22%,
  functions 25%, branches 15%) because many service files are still excluded from
  coverage collection while the test suite is being expanded.
- The `coverage-validation` job in `.github/workflows/testing.yml` is currently disabled
  (`if: false`) pending command-test refactoring.

### Test Layout

```
tests/
├── unit/
│   ├── core/         # CommandBase, CommandOptions, EventBase
│   ├── middleware/   # errorHandler, validators
│   ├── services/     # Guild-aware services, RolePermission, etc.
│   ├── commands/     # Per-command unit tests
│   └── utils/        # Helper tests
├── integration/      # Cross-module workflows + submodule compatibility
└── _archive/         # Legacy tests (not run by Jest)
```

CI runs unit tests on **Node 20.x and Node 22.x** in parallel, then integration tests.
See [`.github/workflows/testing.yml`](.github/workflows/testing.yml).

---

## 📦 Architecture

### Command Pattern

All commands extend `CommandBase`. Errors are caught centrally; permission checks are
handled by `RolePermissionService`.

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess } = require('../../utils/helpers/response-helpers');

const { data, options } = buildCommandOptions('mycommand', 'Description', [
  { name: 'text', type: 'string', required: true },
]);

class MyCommand extends Command {
  constructor() {
    super({ name: 'mycommand', description: 'Description', data, options });
  }

  async executeInteraction(interaction) {
    const text = interaction.options.getString('text');
    await sendSuccess(interaction, `You said: ${text}`);
  }
}

module.exports = new MyCommand().register();
```

### Supported Option Types

`buildCommandOptions` currently supports `string`, `integer`, and `boolean`. Commands
that need other Discord option types (e.g. `user`, `channel`, `role`, `mentionable`,
`number`, `attachment`) must construct the `SlashCommandBuilder` themselves — passing
unsupported types to `buildCommandOptions` will silently skip those options.

### Guild-Aware Services

`GuildDatabaseManager` provisions one SQLite database per guild under `data/`. All
guild-scoped operations go through guild-aware services that require a `guildId`:

```javascript
const QuoteService = require('./src/services/QuoteService');

const quote = await QuoteService.addQuote(interaction.guildId, text, author);
```

The legacy single-database wrapper at `src/database.js` and the `DatabaseService` class
are marked deprecated. New code should use the guild-aware services.

### Feature Flags

`src/config/features.js` reads environment variables to enable subsystems:

| Flag                    | Default | Module                    |
|-------------------------|---------|---------------------------|
| `quotes`                | on      | always enabled            |
| `misc`                  | on      | always enabled            |
| `ENABLE_REMINDERS`      | on      | Reminder system           |
| `ENABLE_PROXY_FEATURES` | off     | Webhook proxy             |
| `ENABLE_ADMIN_COMMANDS` | off     | Admin commands            |
| `ENABLE_DASHBOARD_API`  | off     | In-bot dashboard REST API |

---

## 📝 Command Reference

### Slash Commands

```bash
# Quotes
/random-quote                          # Random quote
/search-quotes query:inspiration       # Search by text/author
/add-quote quote:"..." author:Author   # Add new quote
/quote number:5                        # Get quote by ID
/list-quotes                           # DM list of all quotes
/update-quote                          # Edit a quote (admin)
/delete-quote                          # Delete a quote (admin)
/rate-quote id:5 rating:5              # Rate 1–5 stars
/tag-quote                             # Tag a quote
/quote-stats                           # Statistics
/export-quotes format:json             # Export JSON/CSV

# Reminders
/create-reminder                       # Create a reminder
/list-reminders                        # List reminders
/get-reminder id:...                   # View a reminder
/search-reminders                      # Search reminders
/update-reminder                       # Edit a reminder
/delete-reminder                       # Delete a reminder

# Admin (requires ENABLE_ADMIN_COMMANDS + role)
/broadcast                             # Broadcast a message
/say                                   # Speak as the bot
/whisper                               # DM a user
/embed-message                         # Send a rich embed
/external-action-send                  # Trigger an external action
/external-action-status                # Inspect external action status
/proxy-config                          # Configure webhook proxy
/proxy-enable                          # Toggle proxy
/proxy-status                          # View proxy status

# User preferences
/opt-in                                # Allow bot DMs
/opt-in-request                        # Request opt-in (admin tool)
/opt-out                               # Disallow bot DMs
/comm-status                           # View your communication prefs

# General
/hi name:Alice                         # Say hello
/ping                                  # Ping/pong
/help                                  # Paginated help
/poem type:haiku subject:coffee        # Generate a poem
```

Prefix variants (`!command ...`) are supported in parallel for most commands; see each
command file under `src/commands/` for legacy argument parsing.

---

## 🐳 Docker

```bash
# Build locally
docker build -t verabot2 .

# docker-compose: bot (port 3000) + dashboard (port 5000)
docker-compose up -d
```

The Dockerfile is a multi-stage build on `node:20-alpine` and runs `node src/index.js`
with a `/health` healthcheck. `docker-compose.yml` defines two services
(`verabot2`, `dashboard`) on a shared internal network with a persistent
`verabot_data` volume for SQLite.

---

## 🔧 Development

### Lint, format, validate

```bash
npm run lint          # ESLint (flat config + eslint-plugin-security)
npm run lint:fix
npm run format        # Prettier
npm run format:check
npm run validate      # Custom command validator (scripts/validate-commands.js)
```

Husky + lint-staged is configured for `*.js` (Prettier + ESLint --fix on staged files).

### Database migrations

```bash
npm run db:migrate
npm run db:migrate:status
npm run db:rollback
```

### Documentation tooling

```bash
npm run validate:links            # Check Markdown links
npm run docs:version              # Cross-check version references
npm run docs:badges               # Update README badges
```

---

## 🔁 CI/CD

The `.github/workflows/` directory contains eight active workflows:

- **`pr-checks.yml`** — Fast lint + format check on PR
- **`testing.yml`** — Unit tests on Node 20 & 22, then integration tests
  (coverage validation step is currently disabled)
- **`security.yml`** — `npm audit`, ESLint security plugin, TruffleHog, Semgrep
  (security-audit, OWASP top 10, CWE top 25, nodejs), license compliance,
  scheduled daily at 02:00 UTC
- **`deploy.yml`** — Pre-deploy validation + production deploy on push to `main`
- **`release.yml`** — `semantic-release` on `main` and `develop`
- **`versioning.yml`** — Version bookkeeping
- **`documentation.yml`** / **`documentation-validation.yml`** — Docs build + link
  validation

---

## 🗄️ Database (per guild)

Each guild gets its own SQLite database file (managed by `GuildDatabaseManager`). The
quote-related tables include `quotes`, `quote_ratings`, `tags`, and `quote_tags`. The
reminder system, communication preferences, proxy configuration, and external action
state are also persisted per guild. Migrations are managed via `MigrationManager` and
the `scripts/db/` migration runners.

---

## 📚 Documentation

There are 75+ Markdown files at the repo root and an organized `docs/` tree:

- `docs/user-guides/` — Step-by-step how-to guides
- `docs/admin-guides/` — Operator/admin docs
- `docs/guides/` — Development workflow
- `docs/reference/` — Architecture, database, permissions, configuration, quick refs, reports
- `docs/architecture/` — System design
- `docs/best-practices/` — Coding standards
- `docs/testing/` — Test framework and patterns
- `docs/archived/` — Historical phase documentation

Entry points:

- [`DOCUMENTATION-INDEX.md`](DOCUMENTATION-INDEX.md) — Root-level doc index
- [`docs/INDEX.md`](docs/INDEX.md) — `docs/` navigation
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)
- [`DEFINITION-OF-DONE.md`](DEFINITION-OF-DONE.md)
- [`DOCUMENT-NAMING-CONVENTION.md`](DOCUMENT-NAMING-CONVENTION.md)
- [`CHANGELOG.md`](CHANGELOG.md)

---

## 🤝 Contributing

1. Follow the `CommandBase` pattern for new commands
2. Place commands in the matching `src/commands/<category>/` folder
3. Use the response helpers in `src/utils/helpers/response-helpers.js`
4. Use guild-aware services (not `src/database.js` or `DatabaseService`)
5. Add Jest unit tests under `tests/unit/<area>/`
6. Run `npm run lint` and `npm test` before opening a PR

---

## 📝 License

MIT
