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

Examples

- Slash command (after registering commands):

	- `/poem type:haiku subject:coffee` — returns a short haiku about "coffee".
	- `/poem type:sonnet subject:love` — returns a short sonnet-style poem about "love".
	- `/help` — shows an ephemeral, paginated list of commands.

- Prefix commands (if you use `PREFIX` in `.env`, default `!`):

	- `!poem haiku coffee` — same as `/poem type:haiku subject:coffee`.
	- `!ping` — bot replies `Pong!`.
	- `!hi Alice` — bot says `hello Alice!`.

Registering commands

1. Ensure `.env` has `DISCORD_TOKEN` and `CLIENT_ID`; optionally set `GUILD_ID` for fast registration to a test guild.
2. Run:

```bash
npm run register-commands
```

If `GUILD_ID` is set the commands will register immediately in that server. Global registration can take up to an hour to propagate.
