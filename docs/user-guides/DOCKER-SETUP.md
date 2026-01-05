# Docker Setup Guide for VeraBot2.0

## Current Docker Setup ✅

You already have a production-ready Docker setup:

- ✅ **Dockerfile** - Multi-stage build optimized for Node.js
- ✅ **docker-compose.yml** - Simple service configuration
- ✅ **.dockerignore** - Excludes unnecessary files

---

## Understanding Your Dockerfile

### Multi-Stage Build Pattern (2 stages)

Your Dockerfile uses a smart two-stage approach:

#### Stage 1: Dependencies

```dockerfile
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production
```

- Builds dependency layer once
- Only installs production dependencies (no dev tools)
- Creates reusable layer

#### Stage 2: Runtime

```dockerfile
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN mkdir -p /app/data
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/
COPY scripts/ ./scripts/
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["node", "src/index.js"]
```

- Copies pre-built dependencies from stage 1
- Smaller final image (no build tools)
- Sets up data directory for SQLite
- Includes health check monitoring
- Starts bot with `node src/index.js`

### Why This Design is Good

| Feature            | Benefit                                |
| ------------------ | -------------------------------------- |
| **Multi-stage**    | Smaller image (~150MB vs ~400MB)       |
| **Alpine**         | Tiny base image (5MB)                  |
| **npm ci**         | Faster, more reliable than npm install |
| **Health check**   | Docker monitors bot health             |
| **Data directory** | Persistent SQLite database             |
| **Production env** | Optimized for performance              |

---

## Using Docker

### Build the Image

```bash
# Build Docker image
docker build -t verabot2.0:latest .

# Verify image was created
docker images | grep verabot2.0
```

### Run Manually

```bash
# Run with environment file
docker run -d \
  --name verabot \
  --env-file .env \
  -v verabot-data:/app/data \
  verabot2.0:latest

# View logs
docker logs -f verabot

# Stop container
docker stop verabot

# Remove container
docker rm verabot
```

### Using Docker Compose (Recommended)

```bash
# Start bot in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop bot
docker-compose down

# Rebuild image (if Dockerfile changed)
docker-compose up -d --build
```

### Verify Bot is Running

```bash
# Check container status
docker-compose ps

# View recent logs
docker-compose logs --tail=20

# Execute command in container
docker exec verabot2 node -e "console.log('Container works!')"
```

---

## Environment Setup for Docker

### Create .env File

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

**Required values:**

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
```

**Optional values:**

```env
GUILD_ID=your_guild_id
PROXY_PORT=3000
ENCRYPTION_KEY=your_64_char_hex_key
```

### Important: .env Not in Image

The `.env` file is **not** included in the Docker image (for security). Instead:

1. **Local Development:** Docker Compose reads `.env` from host
2. **Production:** Pass environment variables when running:

```bash
# Docker run with environment variables
docker run -d \
  -e DISCORD_TOKEN="your_token" \
  -e CLIENT_ID="your_client_id" \
  -e GUILD_ID="your_guild" \
  --name verabot \
  verabot2.0:latest

# Or use env file
docker run -d \
  --env-file .env.production \
  --name verabot \
  verabot2.0:latest
```

---

## Persistent Data

### SQLite Database in Docker

Your bot uses SQLite, which stores data as a file. To keep data when container restarts:

#### Using Docker Compose (Automatic)

```yaml
services:
  verabot2:
    build: .
    env_file:
      - .env
    volumes:
      - verabot-data:/app/data # Persistent volume
    restart: unless-stopped

volumes:
  verabot-data: # Named volume definition
```

The volume `verabot-data` persists between container restarts.

#### Accessing Database Files

```bash
# Copy database from container
docker cp verabot2:/app/data/quotes.db ./quotes.db

# Copy database to container
docker cp ./quotes.db verabot2:/app/data/

# Backup database
docker-compose exec verabot2 cp /app/data/quotes.db /app/data/quotes.db.backup
```

#### Check Volume Status

```bash
# List volumes
docker volume ls

# Inspect volume location
docker volume inspect verabot-data

# Remove old volumes (careful!)
docker volume prune
```

---

## Docker Compose Reference

### Current docker-compose.yml

```yaml
services:
  verabot2:
    build: . # Build from Dockerfile
    env_file:
      - .env # Load environment from .env
    restart: unless-stopped # Auto-restart if crashes
```

### Enhanced Version (Optional)

If you want more control, you can expand `docker-compose.yml`:

```yaml
version: '3.8'

services:
  verabot2:
    build:
      context: .
      dockerfile: Dockerfile

    container_name: verabot2

    environment:
      NODE_ENV: production

    env_file:
      - .env

    volumes:
      - verabot-data:/app/data
      - ./logs:/app/logs

    ports:
      - '3000:3000' # For webhook proxy feature

    restart: unless-stopped

    # Health check configuration
    healthcheck:
      test: ['CMD', 'node', '-e', "require('http').get('http://localhost:3000')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

volumes:
  verabot-data:
    driver: local
```

---

## Common Docker Tasks

### View Logs

```bash
# Last 50 lines
docker-compose logs -f --tail=50

# Specific timestamps
docker-compose logs --since 2025-12-29T10:00:00Z

# Follow logs (live)
docker-compose logs -f

# Stop following (Ctrl+C)
```

### Monitor Resources

```bash
# See CPU, memory usage
docker stats verabot2

# Detailed stats
docker stats --no-stream
```

### Update Bot (When Code Changes)

```bash
# Method 1: Rebuild and restart
docker-compose up -d --build

# Method 2: Manual rebuild
docker build -t verabot2.0:latest .
docker-compose down
docker-compose up -d

# Method 3: Keep same image, just restart
docker-compose restart
```

### Database Operations

```bash
# Access SQLite CLI in container
docker-compose exec verabot2 sqlite3 /app/data/quotes.db

# Run SQL commands
docker-compose exec verabot2 sqlite3 /app/data/quotes.db "SELECT COUNT(*) FROM quotes;"

# Backup database
docker-compose exec verabot2 cp /app/data/quotes.db /app/data/quotes.db.$(date +%Y%m%d)

# List all databases
docker-compose exec verabot2 ls -lh /app/data/
```

### Execute Commands in Container

```bash
# Run npm scripts
docker-compose exec verabot2 npm test

# Check environment
docker-compose exec verabot2 env

# Interactive shell
docker-compose exec verabot2 /bin/sh

# One-time commands
docker-compose exec verabot2 node -e "console.log('Hello from Docker')"
```

---

## Troubleshooting

### Bot Won't Start

```bash
# Check logs
docker-compose logs

# Common issues:
# 1. Missing .env file
#    → Create .env from .env.example
# 2. Missing DISCORD_TOKEN
#    → Add token to .env
# 3. Port 3000 already in use
#    → Change PROXY_PORT in .env or docker-compose.yml
```

### Health Check Failing

```bash
# Check health status
docker inspect --format='{{.State.Health}}' verabot2

# Possible issues:
# 1. Bot crashed
#    → Check logs: docker-compose logs
# 2. Health check command wrong
#    → Verify Dockerfile HEALTHCHECK
# 3. Port not listening
#    → Check PROXY_PORT configuration
```

### Database Issues

```bash
# Check database file
docker-compose exec verabot2 ls -lh /app/data/

# Verify database integrity
docker-compose exec verabot2 sqlite3 /app/data/quotes.db "PRAGMA integrity_check;"

# Reset database
docker-compose exec verabot2 rm /app/data/quotes.db
docker-compose restart
```

### Out of Space

```bash
# Clean up old images
docker image prune -a

# Remove unused volumes
docker volume prune

# Check image sizes
docker images --format "{{.Repository}}\t{{.Size}}"
```

---

## Deployment

### Local Deployment

```bash
# 1. Prepare .env
cp .env.example .env
# Edit .env with your tokens

# 2. Start bot
docker-compose up -d

# 3. Verify
docker-compose logs -f
docker-compose ps
```

### VPS/Cloud Deployment

#### Option 1: Use Docker Compose

```bash
# On your server:
# 1. Clone repository
git clone https://github.com/Rarsus/verabot2.0.git
cd verabot2.0

# 2. Create .env with your tokens
nano .env

# 3. Start bot
docker-compose up -d

# 4. Auto-restart on reboot
sudo systemctl enable docker
```

#### Option 2: Use Pre-built Image

```bash
# Pull from registry (if published)
docker pull ghcr.io/rarsus/verabot2.0:latest

# Run container
docker run -d \
  --env-file .env \
  -v verabot-data:/app/data \
  --restart unless-stopped \
  --name verabot2 \
  ghcr.io/rarsus/verabot2.0:latest
```

---

## Best Practices

### Security

✅ **DO:**

- Store secrets in `.env` file (not in image)
- Use specific base image versions (not `latest`)
- Run as non-root user (optional, for extra security)
- Scan images for vulnerabilities

❌ **DON'T:**

- Hardcode secrets in Dockerfile
- Use `COPY .env .` in Dockerfile
- Run as root in container
- Use untrusted base images

### Performance

✅ **DO:**

- Use Alpine Linux (small & fast)
- Use multi-stage builds
- Order Dockerfile layers by change frequency
- Cache dependencies layer

❌ **DON'T:**

- Copy everything at once
- Use latest base image
- Install dev tools in production
- Create huge layers

### Maintenance

✅ **DO:**

- Use `.dockerignore` to exclude files
- Keep Dockerfile simple and documented
- Use consistent naming (tags, containers)
- Monitor logs and health

❌ **DON'T:**

- Commit `.env` to git
- Use hardcoded paths
- Ignore health checks
- Let containers accumulate

---

## Quick Reference

### Most Common Commands

```bash
# Start bot
docker-compose up -d

# View logs
docker-compose logs -f

# Stop bot
docker-compose down

# Rebuild
docker-compose up -d --build

# Execute command
docker-compose exec verabot2 <command>

# Remove everything
docker-compose down -v
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Alpine Linux Docker](https://hub.docker.com/_/alpine)

---

## Next Steps

1. ✅ Build image: `docker build -t verabot2.0:latest .`
2. ✅ Create .env: `cp .env.example .env` (add your tokens)
3. ✅ Start bot: `docker-compose up -d`
4. ✅ Check logs: `docker-compose logs -f`
5. ✅ Verify running: `docker-compose ps`

---

**Your Dockerfile is production-ready! Just add your `.env` file and you're good to go.**
