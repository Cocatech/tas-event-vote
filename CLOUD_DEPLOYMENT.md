# 🚀 Cloud Deployment Guide - TAS Event Vote System

Complete guide for uploading to Git and deploying on Public Cloud platforms.

---

## 📋 Table of Contents

1. [Git Setup & Upload](#git-setup--upload)
2. [Heroku Deployment](#heroku-deployment-easiest)
3. [AWS Deployment](#aws-deployment)
4. [Google Cloud Deployment](#google-cloud-deployment)
5. [Azure Deployment](#azure-deployment)
6. [DigitalOcean Deployment](#digitalocean-deployment)
7. [Render.com Deployment](#rendercom-deployment)
8. [Production Setup](#production-setup)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

# 🔧 Git Setup & Upload

## Step 1: Initialize Git Repository

```bash
cd c:\Project\TAS-Event-Vote

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: TAS Event Vote System"
```

## Step 2: Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `tas-event-vote`
3. Description: `Event Voting System with PHP API and Node.js Frontend`
4. Choose: **Public** (for easier deployment)
5. Click **Create repository**

## Step 3: Connect Local to GitHub

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/tas-event-vote.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Verify Upload

```bash
git remote -v
# Shows:
# origin  https://github.com/YOUR_USERNAME/tas-event-vote.git (fetch)
# origin  https://github.com/YOUR_USERNAME/tas-event-vote.git (push)
```

✅ **Repository is now on GitHub!**

---

## Add .gitignore (Optional but Recommended)

```bash
# Create .gitignore file
echo "node_modules/
.env
.DS_Store
*.log
.vscode/
data/*.json
__pycache__/" > .gitignore

git add .gitignore
git commit -m "Add .gitignore"
git push
```

---

# 🎯 Heroku Deployment (Easiest)

Perfect for quick deployment without credit card (free tier available).

## Prerequisites

- GitHub account (already have ✅)
- Heroku account (free): https://signup.heroku.com/

## Step 1: Install Heroku CLI

**Windows:**
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
# Or use chocolatey
choco install heroku-cli

# Verify
heroku --version
```

**Mac:**
```bash
brew install heroku/brew/heroku
heroku --version
```

**Linux:**
```bash
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
heroku --version
```

## Step 2: Login to Heroku

```bash
heroku login
# Opens browser to authenticate
```

## Step 3: Create Heroku App

```bash
cd c:\Project\TAS-Event-Vote

# Create app (replace with your app name)
heroku create tas-event-vote-app

# Or let Heroku generate name
heroku create
```

## Step 4: Add Procfile

```bash
# Create Procfile (tells Heroku how to run the app)
echo "web: npm start" > Procfile

git add Procfile
git commit -m "Add Heroku Procfile"
git push origin main
```

## Step 5: Deploy

```bash
# Deploy from GitHub
git push heroku main

# Or deploy from GitHub directly (recommended)
heroku git:remote -a tas-event-vote-app
git push heroku main
```

## Step 6: View Your App

```bash
# Open in browser
heroku open

# Or manually
# https://tas-event-vote-app.herokuapp.com
```

## Step 7: Configure Data Persistence

```bash
# Add buildpack for data persistence
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/php

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set API_URL=https://tas-event-vote-app.herokuapp.com/api
```

## View Logs

```bash
# Real-time logs
heroku logs --tail

# Last 50 lines
heroku logs -n 50
```

---

# ☁️ AWS Deployment

Deploy using AWS Elastic Beanstalk (easy) or EC2 (more control).

## Option A: Elastic Beanstalk (Easier)

### Prerequisites
- AWS Account: https://aws.amazon.com/
- AWS CLI installed

### Step 1: Install AWS CLI

```bash
# Download from https://aws.amazon.com/cli/
# Or use installer

aws --version
```

### Step 2: Configure AWS Credentials

```bash
aws configure
# Enter:
# AWS Access Key ID: [your key]
# AWS Secret Access Key: [your secret]
# Default region: us-east-1
# Default output format: json
```

### Step 3: Install Elastic Beanstalk CLI

```bash
# Windows
pip install awsebcli

# Mac/Linux
pip3 install awsebcli

# Verify
eb --version
```

### Step 4: Initialize Elastic Beanstalk

```bash
cd c:\Project\TAS-Event-Vote

eb init -p "Node.js 18 running on 64bit Amazon Linux 2" tas-event-vote
# Select region: us-east-1 (or your preferred)
```

### Step 5: Create Environment & Deploy

```bash
# Create environment
eb create tas-event-vote-env

# Deploy
eb deploy

# Open in browser
eb open
```

### Step 6: Monitor

```bash
# View logs
eb logs

# Check status
eb status

# View environment
eb console
```

---

## Option B: EC2 (More Control)

### Step 1: Launch EC2 Instance

1. Go to **AWS Console** → **EC2**
2. Click **Launch Instance**
3. Select: **Ubuntu Server 22.04 LTS** (free tier eligible)
4. Instance Type: **t2.micro** (free tier)
5. Storage: **20GB** (free tier)
6. Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000, 8000
7. Review and Launch
8. Download `.pem` key file

### Step 2: Connect to Instance

```bash
# Change key permissions
chmod 400 your-key.pem

# SSH into instance (replace IP)
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Setup on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PHP
sudo apt install -y php php-cli php-json

# Install Git
sudo apt install -y git

# Install Docker (optional, recommended)
sudo apt install -y docker.io docker-compose

# Clone repository
git clone https://github.com/YOUR_USERNAME/tas-event-vote.git
cd tas-event-vote

# Install dependencies
npm install
```

### Step 4: Run Application

```bash
# Option 1: Traditional
npm start  # Terminal 1
php -S localhost:8000 -t api/  # Terminal 2

# Option 2: Docker (recommended)
docker-compose up -d
```

### Step 5: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/tas-event-vote
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tas-event-vote /etc/nginx/sites-enabled/

# Test nginx
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 6: Setup SSL (Free with Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate (replace email and domain)
sudo certbot certonly --nginx -d your-domain.com --email your-email@example.com

# Auto-renew
sudo systemctl enable certbot.timer
```

---

# 🌐 Google Cloud Deployment

Using Google Cloud Run (serverless, pay-per-request).

## Prerequisites
- Google Cloud Account: https://console.cloud.google.com/
- Google Cloud CLI installed

## Step 1: Install Google Cloud CLI

```bash
# Download from https://cloud.google.com/sdk/docs/install
# Or use installer

gcloud --version
```

## Step 2: Initialize Google Cloud

```bash
gcloud init
# Follow prompts to login and select project
```

## Step 3: Create Dockerfile (Already Have ✅)

```bash
# Your docker-compose.yml and Dockerfiles already exist!
cd c:\Project\TAS-Event-Vote
ls docker* Dockerfile*
```

## Step 4: Build & Push to Container Registry

```bash
# Set project ID
gcloud config set project YOUR_PROJECT_ID

# Build image
docker build -t gcr.io/YOUR_PROJECT_ID/tas-event-vote-api -f Dockerfile.php .
docker build -t gcr.io/YOUR_PROJECT_ID/tas-event-vote-frontend -f Dockerfile.node .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/tas-event-vote-api
docker push gcr.io/YOUR_PROJECT_ID/tas-event-vote-frontend
```

## Step 5: Deploy to Cloud Run

```bash
# Deploy API
gcloud run deploy tas-event-vote-api \
  --image gcr.io/YOUR_PROJECT_ID/tas-event-vote-api \
  --platform managed \
  --region us-central1 \
  --port 8000

# Deploy Frontend
gcloud run deploy tas-event-vote-frontend \
  --image gcr.io/YOUR_PROJECT_ID/tas-event-vote-frontend \
  --platform managed \
  --region us-central1 \
  --port 3000 \
  --set-env-vars API_URL=https://tas-event-vote-api-xxx.a.run.app
```

## Step 6: View Your App

```bash
gcloud run services list
# Shows your service URLs
```

---

# 💻 Azure Deployment

Using Azure App Service.

## Prerequisites
- Azure Account: https://azure.microsoft.com/
- Azure CLI installed

## Step 1: Install Azure CLI

```bash
# Download from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
# Or use installer

az --version
```

## Step 2: Login to Azure

```bash
az login
# Opens browser to authenticate
```

## Step 3: Create Resource Group

```bash
az group create \
  --name tas-event-vote-rg \
  --location eastus
```

## Step 4: Create App Service Plan

```bash
az appservice plan create \
  --name tas-event-vote-plan \
  --resource-group tas-event-vote-rg \
  --sku B1 \
  --is-linux
```

## Step 5: Create Web App

```bash
az webapp create \
  --resource-group tas-event-vote-rg \
  --plan tas-event-vote-plan \
  --name tas-event-vote-app \
  --runtime "NODE|18-lts"
```

## Step 6: Deploy from GitHub

```bash
# Connect to GitHub
az webapp deployment source config-zip \
  --resource-group tas-event-vote-rg \
  --name tas-event-vote-app \
  --src /path/to/zipped/repo.zip

# Or use GitHub Actions (recommended)
# Go to your GitHub repo → Settings → Deployment
```

## Step 7: Configure Application

```bash
# Set environment variables
az webapp config appsettings set \
  --resource-group tas-event-vote-rg \
  --name tas-event-vote-app \
  --settings NODE_ENV=production API_URL=https://tas-event-vote-app.azurewebsites.net
```

---

# 🌊 DigitalOcean Deployment

Simple and affordable cloud hosting.

## Prerequisites
- DigitalOcean Account: https://www.digitalocean.com/
- SSH key setup (free tier available)

## Step 1: Create Droplet

1. Go to **https://cloud.digitalocean.com/**
2. Click **Create** → **Droplets**
3. Choose **Ubuntu 22.04 LTS**
4. Size: **$4/month** (1GB RAM) - small voting events
5. Region: Closest to your users
6. Authentication: SSH Keys
7. Click **Create Droplet**

## Step 2: SSH into Droplet

```bash
# SSH (replace IP)
ssh root@your-droplet-ip

# Or with key
ssh -i ~/.ssh/id_rsa root@your-droplet-ip
```

## Step 3: Setup on Droplet

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PHP
apt install -y php php-cli php-json

# Install Git
apt install -y git

# Install Docker (recommended)
apt install -y docker.io docker-compose

# Clone repository
git clone https://github.com/YOUR_USERNAME/tas-event-vote.git
cd tas-event-vote

# Install dependencies
npm install
```

## Step 4: Setup PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "tas-event-vote"

# Also start PHP server
pm2 start "php -S localhost:8000 -t api/" --name "tas-api"

# Save config
pm2 save

# Start on boot
pm2 startup

# Monitor
pm2 monit
```

## Step 5: Setup Domain & SSL

```bash
# Point your domain to droplet IP in DNS settings

# Install Certbot
apt install -y certbot python3-certbot-nginx

# Install Nginx
apt install -y nginx

# Get SSL certificate
certbot certonly --standalone -d your-domain.com

# Configure Nginx (see AWS EC2 section for config)
```

---

# 📦 Render.com Deployment

Modern cloud platform, very beginner-friendly.

## Step 1: Create Account

Go to **https://render.com/** and sign up with GitHub.

## Step 2: Connect GitHub Repository

1. Go to Dashboard
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select `tas-event-vote`

## Step 3: Configure Service

```
Name: tas-event-vote
Environment: Node
Build Command: npm install
Start Command: npm start
Plan: Free (or Starter)
```

## Step 4: Environment Variables

Add in Dashboard:
```
NODE_ENV=production
API_URL=https://your-app-name.onrender.com/api
```

## Step 5: Deploy

Click **Create Web Service** - automatic deployment starts!

✅ **Your app is live!** (URL provided)

---

# 🔒 Production Setup

## Environment Variables

Create `.env` file (don't commit to git):

```bash
# .env
NODE_ENV=production
PORT=3000
API_URL=https://your-domain.com/api
PHP_PORT=8000
```

Update `.gitignore`:
```
.env
.env.local
.env.*.local
```

## Security Checklist

```
✅ Use HTTPS/SSL certificates
✅ Set NODE_ENV=production
✅ Add authentication tokens
✅ Rate limiting on API
✅ CORS properly configured
✅ Remove debug logging
✅ Backup data regularly
✅ Monitor error logs
✅ Setup uptime monitoring
```

## Data Backup Strategy

```bash
# Backup data folder daily
0 2 * * * tar -czf /backups/tas-data-$(date +\%Y\%m\%d).tar.gz /app/data/

# Upload to cloud storage
gsutil cp /backups/tas-data-*.tar.gz gs://your-bucket/backups/
```

---

# 📊 Monitoring & Maintenance

## Heroku Monitoring

```bash
# View performance
heroku metrics --dyno

# Scale dynos
heroku ps:scale web=2

# View logs
heroku logs --tail

# Database info
heroku config
```

## AWS CloudWatch

```bash
# View logs (Elastic Beanstalk)
eb logs

# View in AWS Console
# CloudWatch → Logs → /aws/elasticbeanstalk/...
```

## Application Monitoring

### Option 1: New Relic (Free tier)

```bash
npm install newrelic

# Add to top of server.js
require('newrelic');
```

### Option 2: Sentry (Free tier)

```bash
npm install @sentry/node

# Add to server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
```

## Log Aggregation

### ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
docker run -d --name elasticsearch docker.elastic.co/elasticsearch/elasticsearch:8.0.0
docker run -d --name kibana docker.elastic.co/kibana/kibana:8.0.0
```

---

# 🐛 Troubleshooting

## Common Issues & Solutions

### Issue: "Cannot find module"

```bash
# Solution
npm install
npm ci  # Clean install
```

### Issue: Port Already in Use

```bash
# Solution - change port in docker-compose.yml
ports:
  - "3001:3000"  # Instead of 3000:3000
```

### Issue: Data Not Persisting

```bash
# Check volume mounting
docker inspect container_name

# Ensure proper permissions
chmod -R 777 ./data/
```

### Issue: API Connection Failed

```bash
# Check API_URL environment variable
echo $API_URL

# Verify from browser
curl https://your-domain.com/api/event
```

### Issue: Out of Memory

```bash
# Increase memory limit
# Cloud Provider → Scaling → Increase RAM

# Or optimize Node.js
node --max-old-space-size=2048 server.js
```

### Issue: Slow Response

```bash
# Check resource usage
docker stats

# Optimize queries
# Review /api/index.php for slow operations

# Add caching
npm install redis
```

---

# 📈 Scaling for Large Events

## Horizontal Scaling (Multiple Instances)

```yaml
# docker-compose.yml
services:
  frontend:
    deploy:
      replicas: 3  # 3 instances
    environment:
      - LOAD_BALANCER=true
```

## Load Balancing

```nginx
upstream backend {
    server frontend1:3000;
    server frontend2:3000;
    server frontend3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

## Database Scaling

Current JSON storage works for:
- Small events: < 100 participants
- Medium events: 100-1000 participants
- Large events: Consider moving to database

```bash
# For large events, migrate to MongoDB or PostgreSQL
npm install mongoose
# Update /api/index.php to use database
```

---

# 🔄 CI/CD Pipeline

## GitHub Actions Automatic Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "tas-event-vote"
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

---

# ✅ Deployment Checklist

## Pre-Deployment

- [ ] Code committed to GitHub
- [ ] All dependencies in package.json
- [ ] .gitignore configured
- [ ] Environment variables documented
- [ ] Data folder structure created
- [ ] Docker files tested locally
- [ ] All tests passing

## During Deployment

- [ ] Cloud provider account created
- [ ] Authentication configured
- [ ] Environment variables set
- [ ] Database/storage configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Monitoring setup

## Post-Deployment

- [ ] Application accessible
- [ ] Admin dashboard working
- [ ] Voting page functional
- [ ] Results showing correctly
- [ ] Data persisting
- [ ] Logs monitoring
- [ ] Backups configured
- [ ] Team notified

---

# 🎯 Quick Comparison

| Platform | Ease | Cost | Startup | Best For |
|----------|------|------|---------|----------|
| **Heroku** | ⭐⭐⭐⭐⭐ | $7/mo | 5 min | Beginners |
| **Render** | ⭐⭐⭐⭐⭐ | Free+ | 5 min | Small events |
| **DigitalOcean** | ⭐⭐⭐⭐ | $4/mo | 15 min | Learning |
| **AWS** | ⭐⭐⭐ | $0-20/mo | 30 min | Production |
| **Google Cloud** | ⭐⭐⭐ | $0-15/mo | 30 min | Scalability |
| **Azure** | ⭐⭐⭐ | $0-15/mo | 30 min | Enterprise |

**Recommended for most:** **Heroku** (easiest) or **Render** (free tier)

---

# 🚀 Your Deployment Path

## Recommended: Heroku (Easiest)

```bash
# 1. Setup Git
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 3. Login
heroku login

# 4. Create app
heroku create tas-event-vote-app

# 5. Deploy
git push heroku main

# 6. Done! 🎉
heroku open
```

**Total time: 10 minutes**

---

# 📞 Support Resources

- **Heroku Docs:** https://devcenter.heroku.com/
- **AWS Docs:** https://docs.aws.amazon.com/
- **Google Cloud Docs:** https://cloud.google.com/docs
- **Azure Docs:** https://docs.microsoft.com/azure/
- **DigitalOcean Docs:** https://docs.digitalocean.com/
- **Render Docs:** https://render.com/docs

---

**Created:** December 4, 2025
**Status:** ✅ Complete
**Version:** 1.0

**Ready to deploy! Pick your platform and follow the guide above. 🚀**
