#!/bin/bash

# TAS Event Vote - Ubuntu 22.04 Setup Script
# This script installs Docker and deploys the voting system on Ubuntu

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TAS Event Vote - Ubuntu Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   echo "Run with: sudo bash setup-ubuntu.sh"
   exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}[1/7] Updating system packages...${NC}"
apt update
apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install Docker
echo -e "${YELLOW}[2/7] Installing Docker...${NC}"
apt install -y docker.io docker-compose curl wget git
echo -e "${GREEN}✓ Docker installed${NC}"
echo ""

# Step 3: Start Docker service
echo -e "${YELLOW}[3/7] Starting Docker service...${NC}"
systemctl start docker
systemctl enable docker
echo -e "${GREEN}✓ Docker service enabled${NC}"
echo ""

# Step 4: Get current user
CURRENT_USER="${SUDO_USER:-root}"
echo -e "${YELLOW}[4/7] Configuring Docker for user: $CURRENT_USER${NC}"
usermod -aG docker "$CURRENT_USER"
echo -e "${GREEN}✓ User added to docker group${NC}"
echo ""

# Step 5: Clone repository
echo -e "${YELLOW}[5/7] Cloning TAS Event Vote repository...${NC}"
cd /opt
if [ ! -d "tas-event-vote" ]; then
    git clone https://github.com/Cocatech/tas-event-vote.git
    echo -e "${GREEN}✓ Repository cloned${NC}"
else
    echo -e "${YELLOW}Repository already exists, updating...${NC}"
    cd tas-event-vote
    git pull origin main
    cd /opt
fi
echo ""

# Step 6: Create .env file
echo -e "${YELLOW}[6/7] Setting up environment variables...${NC}"
cd /opt/tas-event-vote

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Please enter your Cloudflare Tunnel Token:${NC}"
    read -p "CLOUDFLARE_TOKEN: " CF_TOKEN
    
    cat > .env << EOF
CLOUDFLARE_TOKEN=$CF_TOKEN
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}.env already exists, skipping...${NC}"
fi
echo ""

# Step 7: Start Docker containers
echo -e "${YELLOW}[7/7] Starting Docker containers...${NC}"
docker compose down 2>/dev/null || true
docker compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Verification
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verifying Installation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

sleep 5

# Check container status
echo -e "${YELLOW}Container Status:${NC}"
docker compose ps
echo ""

# Check health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
if curl -s http://localhost/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}⚠ Health check failed - containers may still be starting${NC}"
fi
echo ""

# Final instructions
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Verify containers are running:"
echo "   ${YELLOW}docker compose ps${NC}"
echo ""
echo "2. Test the system:"
echo "   ${YELLOW}curl http://localhost/health${NC}"
echo ""
echo "3. Access the voting system:"
echo "   Local:  http://localhost"
echo "   Public: https://vote.tas-c.com"
echo ""
echo -e "${BLUE}Important:${NC}"
echo "- User $CURRENT_USER is added to docker group"
echo "- You may need to log out/in to activate docker permissions"
echo "- Cloudflare Tunnel will be active for public access"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "   docker compose logs -f              # View logs"
echo "   docker compose restart              # Restart all services"
echo "   docker compose down                 # Stop all services"
echo "   docker compose up -d                # Start services"
echo ""
echo -e "${GREEN}Happy voting! 🎉${NC}"
