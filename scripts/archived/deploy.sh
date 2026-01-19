#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   VeraBot Dashboard Deployment Script         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}❌ Error: .env file not found${NC}"
  echo -e "${YELLOW}Please copy .env.example to .env and configure it${NC}"
  exit 1
fi

# Check required environment variables
echo -e "${BLUE}📋 Checking environment configuration...${NC}"
required_vars=("DISCORD_TOKEN" "CLIENT_ID" "DISCORD_CLIENT_ID" "DISCORD_CLIENT_SECRET" "SESSION_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
  if ! grep -q "^$var=" .env || grep -q "^$var=$" .env || grep -q "^$var=your_" .env; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo -e "${RED}❌ Missing or unconfigured environment variables:${NC}"
  for var in "${missing_vars[@]}"; do
    echo -e "  - ${YELLOW}$var${NC}"
  done
  echo ""
  echo -e "${YELLOW}Please configure these in your .env file${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Environment configuration looks good${NC}"
echo ""

# Build Docker images
echo -e "${BLUE}🔨 Building Docker images...${NC}"
docker-compose build --no-cache

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to build Docker images${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker images built successfully${NC}"
echo ""

# Start containers
echo -e "${BLUE}🚀 Starting containers...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to start containers${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check bot health
echo -e "${BLUE}🔍 Checking bot service...${NC}"
if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Bot service is healthy${NC}"
else
  echo -e "${YELLOW}⚠ Bot service health check failed (may still be starting)${NC}"
fi

# Check dashboard health
echo -e "${BLUE}🔍 Checking dashboard service...${NC}"
if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Dashboard service is healthy${NC}"
else
  echo -e "${YELLOW}⚠ Dashboard service health check failed (may still be starting)${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Deployment Complete!                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Service URLs:${NC}"
echo -e "  • Dashboard: ${GREEN}http://localhost:5000${NC}"
echo -e "  • Bot API:   ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "  1. Go to Discord Developer Portal"
echo -e "  2. Add OAuth2 redirect URI: ${YELLOW}http://localhost:5000/api/auth/callback${NC}"
echo -e "  3. Visit ${GREEN}http://localhost:5000${NC} to access the dashboard"
echo -e "  4. Click 'Login with Discord' to authenticate"
echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo -e "  • View logs:    ${YELLOW}docker-compose logs -f${NC}"
echo -e "  • Stop:         ${YELLOW}docker-compose down${NC}"
echo -e "  • Restart:      ${YELLOW}docker-compose restart${NC}"
echo -e "  • View status:  ${YELLOW}docker-compose ps${NC}"
echo ""
