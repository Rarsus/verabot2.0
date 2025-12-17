# VeraBot2.0

Minimal Discord bot example. Features slash commands and optional legacy prefix commands.

Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set values:

```
DISCORD_TOKEN=...
CLIENT_ID=...
GUILD_ID=... # optional
PREFIX=!
```

3. Register commands (guild is faster):

```bash
npm run register-commands
```

4. Start the bot:

```bash
npm start
```

Development

- Tests: `npm test` (runs a basic command sanity check)
- Docker: `docker build -t verabot2 .` and `docker-compose up -d`
