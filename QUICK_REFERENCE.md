# Quick Reference Guide - TAS Event Vote System

## 🎯 Current Status
✅ **All Docker containers running and healthy**

---

## 📍 Access Points

### Local Development (Windows)
```
Vote Interface:  http://localhost/vote
Admin Panel:     http://localhost/admin (password: tas2024)
API Endpoint:    http://localhost/api/event
Health Check:    http://localhost/health
```

### Production (After Proxmox Deployment)
```
Vote Interface:  https://vote.yourdomain.com/vote
Admin Panel:     https://vote.yourdomain.com/admin
API Endpoint:    https://vote.yourdomain.com/api/event
Health Check:    https://vote.yourdomain.com/health
```

---

## 🐳 Docker Commands

### View Containers
```powershell
docker compose ps
```

### View Logs
```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f nginx
docker compose logs -f frontend
docker compose logs -f php-api
```

### Restart Containers
```powershell
# All containers
docker compose restart

# Specific container
docker compose restart nginx
```

### Stop Containers
```powershell
docker compose down
```

### Start Containers
```powershell
docker compose up -d
```

### Full Rebuild
```powershell
docker compose down
docker compose up --build -d
```

---

## 📊 Container Information

| Service | Image | Port (Public) | Port (Internal) | Status |
|---------|-------|---------------|-----------------|--------|
| Nginx | nginx:alpine | 80, 443 | - | ✅ Running |
| Frontend | Node.js 18 | - | 127.0.0.1:3000 | ✅ Running |
| PHP API | PHP 8.1 | - | 127.0.0.1:8000 | ✅ Running |

---

## 🔄 Common Tasks

### Check System Health
```powershell
# All three checks should return healthy status
Invoke-WebRequest -Uri http://localhost/health -UseBasicParsing
docker compose ps  # Check Status column
docker stats       # View resource usage
```

### Access Admin Panel
1. Open: http://localhost/admin
2. Enter password: `tas2024`
3. Available features:
   - Add/edit/delete participants
   - Add/edit/delete candidates
   - Clear votes only
   - Clear all data
   - View real-time results

### Add Participants
1. Go to Admin Dashboard
2. Click "Add Participant"
3. Enter name and ID
4. QR code generates automatically

### View Voting Results
1. Go to Admin Dashboard
2. View "Results" tab
3. See live vote counts and ranking

---

## 📁 Important Files

```
c:\Project\TAS-Event-Vote\
├── docker-compose.yml          # Container orchestration
├── Dockerfile.nginx            # Nginx image definition
├── Dockerfile.php              # PHP image definition
├── Dockerfile.node             # Frontend image definition
├── nginx.conf                  # Nginx reverse proxy config
├── api/                        # PHP API source code
├── public/                     # Frontend HTML/CSS/JS
├── data/                       # Persistent storage (JSON files)
├── PROXMOX_SETUP.md           # Deployment guide
├── DOCKER_TEST_RESULTS.md     # Test verification
└── SETUP_COMPLETE.md          # Setup summary
```

---

## 🔐 Security Checklist

### Current ✅
- [x] Vote duplicate prevention enabled
- [x] Admin password protection (modal)
- [x] Internal services isolated (127.0.0.1)
- [x] Nginx reverse proxy (single entry point)
- [x] Health checks monitoring

### Before Production ⚠️
- [ ] Change admin password from `tas2024`
- [ ] Set up Cloudflare Tunnel
- [ ] Configure firewall on Proxmox
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up automated backups

---

## 🚀 Deployment Checklist

### Prerequisites
- [ ] Proxmox VE installed
- [ ] Ubuntu 22.04 VM/LXC created
- [ ] Cloudflare account and domain
- [ ] Sufficient disk space (20GB+)

### Deployment Steps
1. [ ] SSH into Proxmox VM/LXC
2. [ ] Install Docker and Docker Compose
3. [ ] Clone GitHub repository
4. [ ] Run `docker compose up -d`
5. [ ] Install Cloudflare Tunnel
6. [ ] Configure DNS records
7. [ ] Test public access
8. [ ] Set up monitoring

### Time Estimate
- Manual setup: 30-45 minutes
- Automated setup: 10-15 minutes

---

## 📞 Troubleshooting

### Containers Won't Start
```powershell
# Check logs
docker compose logs

# Check image availability
docker images

# Rebuild images
docker compose down
docker compose up --build -d
```

### Nginx Health Check Failing
```powershell
# Check Nginx logs
docker compose logs nginx

# Test health endpoint
Invoke-WebRequest http://localhost/health

# Restart Nginx
docker compose restart nginx
```

### Can't Access Frontend/API
```powershell
# Verify containers are running
docker compose ps

# Check network connectivity
docker exec tas-event-vote-nginx wget http://frontend:3000 -O -
docker exec tas-event-vote-nginx wget http://php-api:8000/api/event -O -
```

### Port Already in Use
```powershell
# Find what's using port 80
netstat -ano | findstr :80

# Or change docker-compose.yml ports
# Then restart: docker compose up -d
```

---

## 📈 Monitoring

### Real-time Stats
```powershell
docker stats
```

### Container Metrics
```powershell
docker stats tas-event-vote-nginx
docker stats tas-event-vote-frontend
docker stats tas-event-vote-api
```

### Disk Usage
```powershell
# Check data volume size
$dataSize = (Get-ChildItem -Path "c:\Project\TAS-Event-Vote\data\" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Data storage: $dataSize MB"
```

---

## 📚 Documentation Files

### Full Guides
- **PROXMOX_SETUP.md** - Complete Proxmox deployment guide
- **DOCKER_TEST_RESULTS.md** - All test results and verification
- **SETUP_COMPLETE.md** - Setup summary and next steps

### Source Code
- **api/index.php** - REST API endpoints
- **public/index.html** - Voting interface
- **public/admin.html** - Admin dashboard
- **public/js/admin.js** - Admin functionality
- **server.js** - Node.js development server

---

## 🔗 Useful Links

- GitHub Repository: https://github.com/Cocatech/tas-event-vote
- Docker Hub: https://hub.docker.com
- Cloudflare Dashboard: https://dash.cloudflare.com
- Proxmox Web Interface: https://<proxmox-ip>:8006

---

## ✨ Features Overview

### Voting System
- ✅ Real-time vote counting
- ✅ QR code generation
- ✅ Vote duplicate prevention
- ✅ Thai language support
- ✅ Responsive mobile design

### Admin Features
- ✅ Manage participants
- ✅ Manage candidates
- ✅ View live results
- ✅ Clear votes (without deleting participants)
- ✅ Delete individual participants
- ✅ Password protected access

### Deployment
- ✅ Docker containerized
- ✅ Docker Compose orchestration
- ✅ Nginx reverse proxy
- ✅ Cloudflare Tunnel ready
- ✅ HTTPS/SSL capable

---

## 📞 Support

For issues or questions:
1. Check DOCKER_TEST_RESULTS.md for verification
2. Review PROXMOX_SETUP.md for deployment help
3. Check container logs: `docker compose logs`
4. Visit GitHub: https://github.com/Cocatech/tas-event-vote

---

**Last Updated**: December 4, 2025
**Version**: 2.0
**Status**: ✅ Ready for Production
