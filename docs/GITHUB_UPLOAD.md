# 📤 GitHub Upload Guide

**Complete step-by-step guide to upload TAS Event Vote System to GitHub**

---

## 📋 What You Need

1. **GitHub Account** (free)
2. **Git installed** on your computer
3. **Your project folder** (already have ✅)

---

## 🚀 Step-by-Step Instructions

### Step 1: Create GitHub Account (5 minutes)

1. Go to **https://github.com/signup**
2. Enter email address
3. Create password
4. Choose username (e.g., `your-name` or `your-company`)
5. Click **Create account**
6. Choose free plan
7. Verify email

✅ **Account created!**

---

### Step 2: Install Git (5 minutes)

#### Windows
1. Download from **https://git-scm.com/download/win**
2. Run installer, click **Next** for all options
3. Finish installation

#### Mac
```bash
# Install using Homebrew
brew install git

# Or download from https://git-scm.com/download/mac
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt install git

# Fedora/RHEL
sudo dnf install git
```

**Verify installation:**
```bash
git --version
# Shows: git version 2.x.x
```

✅ **Git installed!**

---

### Step 3: Configure Git Locally (2 minutes)

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your-email@example.com"

# Verify
git config --global --list
```

✅ **Git configured!**

---

### Step 4: Create Repository on GitHub (3 minutes)

1. Go to **https://github.com/new**
2. **Repository name:** `tas-event-vote`
3. **Description:** `Event Voting System with PHP API and Node.js Frontend`
4. **Visibility:** Select **Public** (easier for deployment)
5. Click **Create repository**

✅ **Repository created on GitHub!**

You'll see something like:
```
https://github.com/YOUR_USERNAME/tas-event-vote
```

---

### Step 5: Upload Your Code (5 minutes)

Navigate to your project folder and run these commands:

```bash
# Change to project directory
cd c:\Project\TAS-Event-Vote

# Initialize git repository
git init

# Add all files to staging
git add .

# Create first commit
git commit -m "Initial commit: TAS Event Vote System"

# Check remote connection
git remote add origin https://github.com/YOUR_USERNAME/tas-event-vote.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**What each command does:**

| Command | Purpose |
|---------|---------|
| `git init` | Initialize git in your folder |
| `git add .` | Stage all files for commit |
| `git commit` | Create a snapshot of your code |
| `git remote add origin` | Connect to GitHub repository |
| `git push` | Upload code to GitHub |

✅ **Code uploaded to GitHub!**

---

## ✅ Verify Upload

### Option 1: Check on GitHub Website
1. Go to **https://github.com/YOUR_USERNAME/tas-event-vote**
2. You should see all your files listed
3. You should see your commit message

### Option 2: Check in Terminal
```bash
# Verify remote connection
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/tas-event-vote.git (fetch)
# origin  https://github.com/YOUR_USERNAME/tas-event-vote.git (push)
```

✅ **Everything uploaded successfully!**

---

## 📁 Files on GitHub

You should see:

```
tas-event-vote/
├── api/
│   ├── config.php
│   └── index.php
├── public/
│   ├── admin.html
│   ├── vote.html
│   ├── results.html
│   ├── index.html
│   └── js/
├── data/
├── docker-compose.yml
├── Dockerfile.php
├── Dockerfile.node
├── package.json
├── server.js
├── *.md (documentation)
└── ... (other files)
```

---

## 🔧 Add .gitignore (Recommended)

This prevents uploading unnecessary files:

```bash
# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.DS_Store
*.log
.vscode/
.idea/
dist/
build/
EOF

# Add to git
git add .gitignore
git commit -m "Add .gitignore"
git push origin main
```

---

## 🔐 Setup GitHub Authentication (Important!)

For future pushes, setup one of these:

### Option 1: SSH Key (Recommended, more secure)

**Generate SSH key:**
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for all prompts
```

**Add to GitHub:**
1. Copy key: `cat ~/.ssh/id_ed25519.pub` (Mac/Linux) or use PuTTY (Windows)
2. Go to **GitHub Settings → SSH and GPG keys**
3. Click **New SSH key**
4. Paste your public key
5. Click **Add SSH key**

**Use SSH URL:**
```bash
# Update remote to use SSH
git remote set-url origin git@github.com:YOUR_USERNAME/tas-event-vote.git

# Test connection
ssh -T git@github.com
```

### Option 2: Personal Access Token (Easier)

1. Go to **GitHub Settings → Developer settings → Personal access tokens**
2. Click **Generate new token**
3. Select scopes: `repo`, `workflow`
4. Copy the token
5. Use as password when pushing

---

## 📤 Future Uploads (After Initial Setup)

Every time you make changes:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

---

## 🔄 Common Git Commands

### Check Status
```bash
git status
# Shows modified, new, deleted files
```

### View Changes
```bash
git diff
# Shows what changed in files
```

### View History
```bash
git log
# Shows all commits
git log --oneline
# Shows shorter version
```

### Undo Changes
```bash
# Undo changes in file
git checkout FILE_NAME

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Create Branch
```bash
# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Push branch
git push origin feature/new-feature
```

---

## 🚨 Common Issues & Solutions

### Issue: "Permission denied (publickey)"

**Solution:**
```bash
# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519

# Or use HTTPS instead:
git remote set-url origin https://github.com/YOUR_USERNAME/tas-event-vote.git
```

### Issue: "fatal: not a git repository"

**Solution:**
```bash
# Initialize git in current folder
git init
```

### Issue: "Everything up-to-date" but changes not showing on GitHub

**Solution:**
```bash
# Ensure you committed
git status

# Ensure you're on main branch
git branch

# Force push (use carefully!)
git push -u origin main -f
```

### Issue: Large files causing upload to fail

**Solution:**
```bash
# Don't commit large files, use .gitignore
echo "large-file.zip" >> .gitignore
git rm --cached large-file.zip
git commit -m "Remove large file"
git push
```

---

## 🌳 GitHub Repository Management

### Change Repository Settings

1. Go to your repository
2. Click **Settings** (top right)
3. Configure:
   - **Repository name** - Change if needed
   - **Description** - Update description
   - **Visibility** - Keep public for deployment
   - **Branches** - Set main as default

### Protect Main Branch (Recommended)

1. **Settings → Branches**
2. Add rule for `main` branch
3. Require pull requests before merging
4. Dismiss stale reviews

### Enable GitHub Pages (Optional, for docs)

1. **Settings → Pages**
2. Select **main** branch
3. Docs are now available at:
   ```
   https://YOUR_USERNAME.github.io/tas-event-vote/
   ```

---

## 📊 Repository Stats

After upload, view:

1. **Insights tab** - Code frequency, contributors
2. **Network tab** - Commit history
3. **Releases tab** - Create release versions
4. **Wiki tab** - Add documentation

---

## 🎯 Next Steps After GitHub Upload

### Ready for Cloud Deployment!

Now that code is on GitHub:

1. **Heroku** - Connect GitHub for automatic deploy
2. **AWS** - Pull code from GitHub
3. **Google Cloud** - Use Cloud Build from GitHub
4. **Azure** - Connect GitHub Actions
5. **Render** - Auto-deploy on every push

See `CLOUD_DEPLOYMENT.md` for details!

---

## 🔗 GitHub Links & Resources

- **Your Repository:** https://github.com/YOUR_USERNAME/tas-event-vote
- **Git Documentation:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **GitHub Desktop:** https://desktop.github.com/ (GUI version of git)
- **GitHub CLI:** https://cli.github.com/ (command-line tool)

---

## 💡 Pro Tips

### Use GitHub Desktop (GUI Alternative)

If command line is intimidating:

1. Download **https://desktop.github.com/**
2. Open project folder
3. Click **Publish repository**
4. Drag and drop files to commit
5. Click **Sync** to push

Much easier for beginners!

---

### Commit Messages Best Practices

```bash
# Good commit messages
git commit -m "Add QR code generation feature"
git commit -m "Fix voting results display bug"
git commit -m "Update README with deployment info"

# Bad commit messages
git commit -m "Update"
git commit -m "Fix"
git commit -m "asdf"
```

---

### Keep Your Repository Clean

```bash
# Before committing, exclude:
# - node_modules/    (reinstall with npm install)
# - .env files       (sensitive data)
# - .DS_Store        (Mac system files)
# - *.log files      (temporary logs)

# Use .gitignore to exclude these automatically
```

---

## ✅ Upload Checklist

- [ ] GitHub account created
- [ ] Git installed and configured
- [ ] Repository created on GitHub
- [ ] `git init` executed in project folder
- [ ] `git add .` executed
- [ ] `git commit` created
- [ ] `git remote add origin` connected
- [ ] `git push` uploaded to GitHub
- [ ] Verified files on GitHub website
- [ ] .gitignore added (recommended)
- [ ] Ready for cloud deployment!

---

## 🎉 Success!

Your code is now on GitHub and ready for:

✅ Cloud deployment (Heroku, AWS, Google Cloud, etc.)
✅ Team collaboration (if you invite members)
✅ Version control (track all changes)
✅ Backup (your code is safe on GitHub)
✅ Public sharing (others can clone and use)

---

## 📞 Quick Commands Reference

```bash
# Initial setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOU/tas-event-vote.git
git push -u origin main

# Daily workflow
git status           # Check what changed
git add .            # Stage changes
git commit -m "msg"  # Commit
git push             # Push to GitHub

# View history
git log --oneline    # See all commits
git show COMMIT_ID   # See specific commit

# Undo mistakes
git reset --soft HEAD~1  # Undo last commit
git checkout FILE        # Restore file
```

---

**Created:** December 4, 2025
**Status:** ✅ Complete
**Next:** Ready for Cloud Deployment!

---

## 🚀 Ready for the Next Step?

After GitHub upload, follow `CLOUD_DEPLOYMENT_QUICK.md` to deploy your app to the cloud!

**Recommended:** Heroku (easiest) or Render (free tier)

Good luck! 🎊
