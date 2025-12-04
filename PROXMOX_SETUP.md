# Proxmox Deployment Guide for TAS Event Vote System

This guide provides step-by-step instructions to deploy the TAS Event Vote System on a Proxmox LXC container or VM using Cloudflare Tunnel for secure public access.

## Prerequisites

- Proxmox VE installed and configured
- Ubuntu 22.04 LTS VM or LXC container
- Cloudflare account with a registered domain
- Root or sudo access on the Ubuntu system
- Internet connectivity

## Architecture Overview

```
┌──────────────────────┐
│  Cloudflare Tunnel   │
│  (Public Domain)     │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│   Proxmox VM/LXC     │
│    (Ubuntu 22.04)    │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     ↓           ↓
┌────────┐   ┌────────┐
│ Nginx  │   │ Docker │
│(80/443)│   │Compose │
└────────┘   └────┬───┘
                  │
        ┌─────────┼─────────┐
        ↓         ↓         ↓
    ┌───────┐ ┌───────┐ ┌────────┐
    │PHP API│ │Frontend│ │Nginx   │
    │:8000  │ │:3000   │ │:80/443 │
    └───────┘ └───────┘ └────────┘
```

## Step 1: Create Proxmox VM/LXC with Ubuntu 22.04

### Option A: Create a VM (Recommended)

1. **In Proxmox Web UI:**
   - Click `Datacenter` → `Create VM`
   - **General:**
     - VM ID: 100
     - Name: `tas-event-vote`
     - Resource Pool: Default (or your choice)
   - **OS:** Ubuntu 22.04 LTS
   - **System:**
     - Machine: Default
     - BIOS: Default
     - EFI: Checked
   - **Disks:**
     - Storage: local (or your storage)
     - Disk size: 20 GB
   - **CPU:** 2 cores
   - **Memory:** 4096 MB (4GB)
   - **Network:** Default bridge
   - Complete VM creation

2. **Boot the VM and configure network:**
   ```bash
   # Connect via console
   # Set IP address (DHCP or static)
   ip a  # Check current IP
   
   # Optional: Set static IP
   sudo nano /etc/netplan/00-installer-config.yaml
   # Edit and save, then apply:
   sudo netplan apply
   ```

### Option B: Create an LXC Container

1. **In Proxmox Web UI:**
   - Click `Datacenter` → `Create CT`
   - **General:**
     - CT ID: 200
     - Hostname: `tas-event-vote`
     - Resource Pool: Default
   - **Template:** ubuntu-22.04
   - **Root Disk:** 20 GB
   - **CPU:** 2 cores
   - **Memory:** 4096 MB
   - **Network:** Automatic DHCP
   - Complete container creation

2. **Start the container and access:**
   ```bash
   # From Proxmox host
   pve-lxc-ct-start 200  # Or use web UI
   pct console 200
   
   # Inside container
   ip a  # Check IP address
   ```

## Step 2: Install Docker & Docker Compose

SSH into your VM/LXC (replace IP with your actual IP):

```bash
ssh root@<YOUR_IP>
```

### Install Docker:

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker dependencies
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker & Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version
```

### Add user to docker group (optional but recommended):

```bash
sudo usermod -aG docker $USER
# You'll need to log out and back in for this to take effect
```

## Step 3: Clone Project Repository

```bash
cd /opt
git clone https://github.com/Cocatech/tas-event-vote.git
cd tas-event-vote

# Verify structure
ls -la
```

## Step 4: Configure Environment (Optional)

If you need custom configuration, edit files before starting:

```bash
# Check server.js for frontend configuration
nano server.js

# Edit docker-compose.yml if needed for production
nano docker-compose.yml
```

## Step 5: Start Docker Containers

```bash
cd /opt/tas-event-vote

# Pull images and start containers
sudo docker compose up -d

# Monitor startup
sudo docker compose logs -f

# Check container status
sudo docker compose ps
```

### Expected output:
```
CONTAINER ID   IMAGE                      STATUS
xxxxx          tas-event-vote-nginx       Up 2 minutes (healthy)
xxxxx          tas-event-vote-frontend    Up 2 minutes
xxxxx          tas-event-vote-api         Up 2 minutes
```

## Step 6: Verify Local Access

```bash
# Test Nginx health check
curl http://localhost/health
# Should return: "healthy"

# Test API endpoint
curl http://localhost/api/status
# Should return JSON response

# Test frontend (returns HTML)
curl http://localhost/ | head -20
```

## Step 7: Install Cloudflare Tunnel

### Install Cloudflare Tunnel agent:

```bash
# Download cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install
sudo dpkg -i cloudflared.deb

# Verify
cloudflared version
```

### Authenticate with Cloudflare:

```bash
# Login and authorize
cloudflared tunnel login

# This will open a browser for authentication
# Select your domain when prompted
```

### Create tunnel:

```bash
# Create new tunnel
cloudflared tunnel create tas-event-vote

# This creates a tunnel and saves credentials to:
# ~/.cloudflared/<tunnel-id>.json
# and token to: ~/.cloudflared/<tunnel-id>.crt

# Note the tunnel ID for the next step
```

## Step 8: Configure Tunnel Routes

Create tunnel config file:

```bash
# Create config directory
mkdir -p ~/.cloudflared

# Create config file
nano ~/.cloudflared/config.yml
```

Insert the following (replace TUNNEL_ID and DOMAIN):

```yaml
tunnel: tas-event-vote
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: vote.yourdomain.com
    service: http://localhost
  - service: http_status:404
```

### Test tunnel configuration:

```bash
# Validate config syntax
cloudflared tunnel validate

# Test tunnel (runs in foreground)
cloudflared tunnel run tas-event-vote
```

## Step 9: Create DNS Records

In Cloudflare Dashboard:

1. Go to your domain's DNS settings
2. Add CNAME record:
   - Name: `vote` (or subdomain you prefer)
   - Target: `<TUNNEL_ID>.cfargotunnel.com`
   - Proxy status: Proxied (orange cloud)
   - TTL: Auto
3. Save

## Step 10: Install Cloudflare Tunnel as Service

```bash
# Install as systemd service
sudo cloudflared service install

# Start the service
sudo systemctl start cloudflared

# Enable auto-start on reboot
sudo systemctl enable cloudflared

# Check service status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f
```

## Step 11: Verify Public Access

```bash
# Test from another machine
curl https://vote.yourdomain.com/health

# Or open in browser: https://vote.yourdomain.com
# Should show the voting interface
```

## Step 12: Enable HTTPS (Optional but Recommended)

Cloudflare Tunnel automatically provides HTTPS. Additional setup:

1. **Enable Full (strict) SSL in Cloudflare:**
   - Dashboard → SSL/TLS → Overview
   - Set to "Full (strict)"
   - Wait for propagation

2. **Update Nginx config (if using internal SSL):**
   ```bash
   # Copy SSL certificates to VM
   scp server.crt root@<IP>:/opt/tas-event-vote/ssl/
   scp server.key root@<IP>:/opt/tas-event-vote/ssl/
   
   # Uncomment HTTPS sections in nginx.conf
   nano nginx.conf
   
   # Restart Nginx
   docker compose restart nginx
   ```

## Troubleshooting

### Containers won't start:

```bash
# Check logs
docker compose logs api
docker compose logs frontend
docker compose logs nginx

# Rebuild containers
docker compose down
docker compose up --build -d
```

### Nginx health check failing:

```bash
# Check Nginx logs
docker compose exec nginx cat /var/log/nginx/error.log

# Test manually
docker compose exec nginx wget --quiet --tries=1 --spider http://localhost/health
```

### Cloudflare Tunnel not connecting:

```bash
# Check tunnel status
cloudflared tunnel list

# Check credentials
ls -la ~/.cloudflared/

# Restart service
sudo systemctl restart cloudflared

# View logs
sudo journalctl -u cloudflared -f
```

### Can't reach the application:

```bash
# Verify Docker containers
docker ps

# Check port bindings
netstat -an | grep 80

# Test Nginx directly
curl http://localhost

# Check DNS resolution
nslookup vote.yourdomain.com
```

## Monitoring & Maintenance

### View application logs:

```bash
# All containers
docker compose logs -f

# Specific service
docker compose logs -f frontend

# With timestamps
docker compose logs -f --timestamps api
```

### Restart services:

```bash
# Restart all
docker compose restart

# Restart specific
docker compose restart frontend
```

### Update application:

```bash
cd /opt/tas-event-vote

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose up --build -d
```

### Backup data:

```bash
# Backup data directory
tar -czf /backups/tas-event-vote-data-$(date +%Y%m%d).tar.gz /opt/tas-event-vote/data/

# Backup full project
tar -czf /backups/tas-event-vote-full-$(date +%Y%m%d).tar.gz /opt/tas-event-vote/
```

## Security Recommendations

1. **Change default admin password:**
   - Default: `tas2024`
   - Modify in frontend code before deployment

2. **Enable firewall on Proxmox:**
   ```bash
   # Only allow Cloudflare IPs to reach Nginx
   sudo ufw allow from 173.245.48.0/20
   sudo ufw allow from 103.21.244.0/22
   # (See Cloudflare IP ranges documentation)
   ```

3. **Regular backups:**
   - Schedule backup script with cron
   - Keep backups off-site

4. **Monitor resources:**
   ```bash
   # Check resource usage
   docker stats
   
   # View disk usage
   df -h
   du -h /opt/tas-event-vote/data/
   ```

## Performance Tuning

### For high-traffic events:

1. **Increase Nginx worker connections:**
   ```
   worker_connections 2048;
   ```

2. **Increase PHP worker processes:**
   - Modify `docker-compose.yml` PHP command

3. **Enable Cloudflare caching:**
   - In Cloudflare Dashboard → Caching → Cache Rules
   - Cache static assets longer

4. **Monitor and scale:**
   ```bash
   # Monitor resource usage
   watch -n 5 'docker stats --no-stream'
   ```

## Support & Updates

- GitHub: https://github.com/Cocatech/tas-event-vote
- Issues: Report via GitHub Issues
- Updates: Pull latest code from main branch

## Reference Ports

- **Nginx (Public):** 80/443
- **Frontend (Internal):** 3000
- **API (Internal):** 8000
- **Docker Network:** tas-network

---

**Last Updated:** December 4, 2024
**Version:** 1.0
**Author:** Cocatech

For additional help, consult the GitHub repository documentation.
