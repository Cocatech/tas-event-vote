# 🐳 Docker Setup Guide - TAS Event Vote System

## Complete Docker Implementation

This guide explains how to run the entire TAS Event Vote System using Docker containers.

---

## ✨ Why Docker?

- ✅ **Zero Setup** - No need to install PHP or Node.js
- ✅ **Consistent Environment** - Works the same on any machine
- ✅ **Easy Scaling** - Run multiple containers
- ✅ **Isolation** - Services run independently
- ✅ **Easy Cleanup** - Just remove containers
- ✅ **Production Ready** - Same environment as deployment

---

## 📋 Prerequisites

### Windows
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- Windows 10/11 (Pro, Enterprise, or Home)
- WSL 2 (Windows Subsystem for Linux 2)

### Mac
- [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
- macOS 11+

### Linux
```bash
# Ubuntu/Debian
sudo apt-get install docker.io docker-compose

# Or use Docker Engine: https://docs.docker.com/engine/install/
```

---

## 🚀 Quick Start with Docker

### Step 1: Install Docker Desktop
Download and install from [docker.com](https://www.docker.com/products/docker-desktop)

### Step 2: Verify Installation
```bash
docker --version
docker-compose --version
```

### Step 3: Run Setup Script

**Windows:**
```bash
docker-setup.bat
```

**Mac/Linux:**
```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

### Step 4: Start Containers
```bash
docker-compose up
```

### Step 5: Open Browser
- **Admin**: http://localhost:3000/admin
- **Vote**: http://localhost:3000/vote
- **Results**: http://localhost:3000/results

---

## 📦 Container Architecture

```
┌─────────────────────────────────────────┐
│      Docker Network: tas-network        │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  PHP API Container               │  │
│  │  Container: tas-event-vote-api   │  │
│  │  Port: 8000                      │  │
│  │  Image: php:8.1-cli              │  │
│  │  - Runs API server               │  │
│  │  - Manages JSON data             │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Node.js Frontend Container      │  │
│  │  Container: tas-event-vote-frond │  │
│  │  Port: 3000                      │  │
│  │  Image: node:18-alpine           │  │
│  │  - Serves HTML/CSS/JS            │  │
│  │  - Proxies to PHP API            │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Shared Volume: data/            │  │
│  │  - event.json                    │  │
│  │  - candidates.json               │  │
│  │  - participants.json             │  │
│  │  - votes.json                    │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🛠️ Docker Commands

### Start Containers
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background
docker-compose up -d
```

### View Logs
```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs -f php-api
docker-compose logs -f frontend
```

### Stop Containers
```bash
# Stop all
docker-compose stop

# Stop specific
docker-compose stop php-api
```

### Remove Containers
```bash
# Remove all containers
docker-compose down

# Remove with volumes
docker-compose down -v
```

### View Running Containers
```bash
docker ps

# See all containers
docker ps -a
```

### Access Container Shell
```bash
# PHP container
docker exec -it tas-event-vote-api bash

# Node container
docker exec -it tas-event-vote-frontend sh
```

### View Container Details
```bash
docker inspect tas-event-vote-api
docker inspect tas-event-vote-frontend
```

---

## 📂 File Structure with Docker

```
c:\Project\TAS-Event-Vote/
│
├── docker-compose.yml           ← Docker configuration
├── Dockerfile.php              ← PHP container config
├── Dockerfile.node             ← Node.js container config
├── docker-setup.bat            ← Windows setup script
├── docker-setup.sh             ← Linux/Mac setup script
├── .dockerignore               ← Files to ignore in Docker
│
├── api/                        ← PHP backend (mounted to container)
│   ├── index.php
│   └── config.php
│
├── public/                     ← Frontend files (mounted to container)
│   ├── index.html
│   ├── admin.html
│   ├── vote.html
│   ├── results.html
│   └── js/
│
├── data/                       ← Shared data volume
│   ├── event.json
│   ├── candidates.json
│   ├── participants.json
│   └── votes.json
│
└── server.js                   ← Node.js server
```

---

## 🌐 Network Configuration

### Container Communication
```
Your Browser
    ↓
Port 3000 (Node.js Frontend)
    ↓
Port 8000 (PHP API) via internal network
    ↓
data/ volume (shared)
```

### External Access
```
http://localhost:3000           (Frontend)
http://localhost:8000           (API - internal use)
```

### From Container to Container
```
Node.js can reach PHP at: http://php-api:8000
Both can access: /var/www/html/data/ (mounted volume)
```

---

## 📊 Environment Configuration

### docker-compose.yml Settings

```yaml
services:
  php-api:
    ports:
      - "8000:8000"           # Port mapping: host:container
    volumes:
      - ./api:/var/www/html/api              # Code mount
      - ./data:/var/www/html/data            # Data mount
    environment:
      - PHP_ENV=development
    networks:
      - tas-network          # Connected to network

  frontend:
    ports:
      - "3000:3000"
    volumes:
      - ./public:/app/public
      - ./server.js:/app/server.js
    environment:
      - NODE_ENV=development
      - API_URL=http://php-api:8000        # Internal URL
    depends_on:
      - php-api              # Wait for PHP to start
```

---

## 🔄 Development Workflow

### Live Code Updates (Hot Reload)

Since volumes are mounted, changes to code are reflected immediately:

1. **Edit PHP file** → Changes appear in container instantly
2. **Edit JavaScript** → Refresh browser to see changes
3. **Edit HTML** → Refresh browser immediately
4. **Add candidate** → JSON files update in real-time

### No Need to Rebuild
```
❌ Don't need to: docker-compose build
✅ Just edit files and test
```

---

## 🐛 Troubleshooting Docker

### Container Won't Start
```bash
# Check logs
docker-compose logs php-api
docker-compose logs frontend

# Check status
docker ps -a

# Rebuild
docker-compose build --no-cache
docker-compose up
```

### Port Already in Use
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Use different port in docker-compose.yml
ports:
  - "3001:3000"  # Changed from 3000:3000
```

### Data Not Persisting
```bash
# Check volume mounting
docker inspect tas-event-vote-api | grep -A 10 Mounts

# Ensure data folder has write permissions
chmod 777 data/
```

### Can't Connect Between Containers
```bash
# Check network
docker network ls
docker network inspect tas-network

# Verify containers are on same network
docker inspect tas-event-vote-api | grep NetworkMode
```

---

## 🔐 Security for Docker

### Production Considerations
```dockerfile
# Use specific versions
FROM php:8.1.0-cli          # Not: FROM php:latest
FROM node:18.0.0-alpine     # Not: FROM node:latest

# Run as non-root user
RUN useradd -m appuser
USER appuser

# Use environment variables
ENV API_URL=${API_URL}
ENV NODE_ENV=production
```

### Secrets Management
```bash
# Don't hardcode secrets, use .env
API_KEY=your_secret_key

# In docker-compose.yml
env_file: .env
```

### Network Isolation
```yaml
# Only expose necessary ports
ports:
  - "3000:3000"  # Frontend (exposed)
  # 8000 is NOT exposed (only internal access)
```

---

## 📈 Scaling with Docker

### Run Multiple Instances
```bash
# Scale frontend to 3 instances
docker-compose up --scale frontend=3

# Use load balancer (nginx)
```

### Multi-Host Deployment
```bash
# Use Docker Swarm or Kubernetes
docker swarm init
docker stack deploy -c docker-compose.yml tas-vote
```

---

## 💾 Backup and Restore

### Backup Data
```bash
# Copy data folder
cp -r data data-backup-$(date +%Y%m%d)

# Or use Docker volume
docker run --rm -v tas-event-vote-data:/data -v $(pwd):/backup \
  ubuntu tar cvf /backup/backup.tar /data
```

### Restore Data
```bash
# Copy data back
cp data-backup-20241203/* data/

# Or restore volume
docker run --rm -v tas-event-vote-data:/data -v $(pwd):/backup \
  ubuntu tar xvf /backup/backup.tar
```

---

## 🚀 Deployment Options

### Docker Compose (Development/Testing)
```bash
docker-compose up
```

### Docker Swarm (Small Scale)
```bash
docker swarm init
docker stack deploy -c docker-compose.yml tas-vote
```

### Kubernetes (Enterprise)
```bash
# Convert to Kubernetes manifests
kompose convert -f docker-compose.yml

# Deploy
kubectl apply -f .
```

### Cloud Deployment
- **Heroku**: `heroku container:push`
- **AWS**: `aws ecs create-service`
- **Azure**: `az container create`
- **DigitalOcean**: `doctl apps create`

---

## 🧪 Testing with Docker

### Run Tests
```bash
# Execute test script in container
docker exec tas-event-vote-api php /var/www/html/api/test.php

# Or npm tests in frontend
docker exec tas-event-vote-frontend npm test
```

### Debug Container
```bash
# Interactive bash
docker exec -it tas-event-vote-api bash

# View files
docker exec tas-event-vote-api ls -la /var/www/html/data/

# Check PHP version
docker exec tas-event-vote-api php --version
```

---

## 📊 Monitoring

### View Resource Usage
```bash
# Real-time stats
docker stats

# Specific container
docker stats tas-event-vote-api
```

### Health Checks
```bash
# Check if containers are healthy
docker ps --format "table {{.Names}}\t{{.Status}}"

# Or more detailed
docker inspect --format='{{.State.Health}}' tas-event-vote-api
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build & Deploy

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: docker-compose build
      - name: Push
        run: docker push myrepo/tas-event-vote
```

---

## 📚 Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PHP Docker Images](https://hub.docker.com/_/php)
- [Node.js Docker Images](https://hub.docker.com/_/node)

---

## ✅ Docker Setup Checklist

- [ ] Docker Desktop installed
- [ ] Docker running
- [ ] Ports 3000 and 8000 available
- [ ] Run `docker-setup.bat` or `docker-setup.sh`
- [ ] Verify: `docker ps`
- [ ] Run: `docker-compose up`
- [ ] Open: http://localhost:3000/admin
- [ ] Test voting system
- [ ] Check logs: `docker-compose logs -f`

---

## 🎉 Ready for Docker!

Your system is now fully containerized.

```bash
# One command to start everything:
docker-compose up
```

**All services running automatically!** 🚀

---

**Docker Setup Version**: 1.0.0
**Last Updated**: December 4, 2024
**Status**: ✅ Production Ready
