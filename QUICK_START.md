# 🚀 Quick Start Guide - TAS Event Vote System

## ⚡ Fast Setup (5 minutes)

### Terminal 1: Start PHP API Server
```powershell
cd c:\Project\TAS-Event-Vote
php -S localhost:8000 -t api/
```

Expected output:
```
Development Server (http://localhost:8000)
Listening on http://localhost:8000
Press Ctrl-C to quit.
```

### Terminal 2: Start Node.js Server
```powershell
cd c:\Project\TAS-Event-Vote
npm install
npm start
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║           TAS EVENT VOTE SYSTEM STARTED                    ║
╚════════════════════════════════════════════════════════════╝

📱 Frontend Server: http://localhost:3000
📊 Admin Dashboard: http://localhost:3000/admin
🗳️ Voting Page: http://localhost:3000/vote
📈 Results Page: http://localhost:3000/results
```

### Open in Browser
1. **Admin Dashboard**: http://localhost:3000/admin
2. **Voting Page**: http://localhost:3000/vote
3. **Results Page**: http://localhost:3000/results

---

## 📋 Step-by-Step Usage

### 1️⃣ Setup Event (Admin)
1. Open http://localhost:3000/admin
2. Go to "Event Settings"
3. Enter event name and max participants (e.g., 100)
4. Click "Save Settings"

### 2️⃣ Add Candidates (Admin)
1. Go to "Manage Candidates"
2. Add candidates one by one:
   - Name: "Candidate 1"
   - Description: "Department/Role"
   - Click "Add Candidate"
3. Repeat for all candidates

### 3️⃣ Start Event (Admin)
1. Go to "Event Settings"
2. Click "▶️ Start Event" button
3. Status will change to "Running"

### 4️⃣ Register Voters
1. Open http://localhost:3000/vote on participant's phone/tablet
2. Or scan the QR code shown in Admin Dashboard
3. Enter name and phone number
4. Click "Register & Start Voting"

### 5️⃣ Cast Votes
1. See all candidates displayed
2. Click voting level buttons:
   - 🥇 Level 1 = 15 points (most important)
   - 🥈 Level 2 = 10 points
   - 🥉 Level 3 = 5 points (least important)
3. Can vote for multiple candidates
4. Click "Submit Your Votes"

### 6️⃣ View Results (Admin)
1. Go to "Live Results" in Admin Dashboard
2. See:
   - Top 3 candidates (Podium)
   - Complete rankings
   - Charts and statistics
3. Results update automatically every 2-3 seconds

### 7️⃣ View Results (Public)
1. Open http://localhost:3000/results
2. See live leaderboard and podium
3. Watch rankings update in real-time

---

## 🎯 Key Features Demo

### QR Code
- Automatically generated in Admin Dashboard
- Click "Download QR Code" to save image
- Print for event or display on screen
- Participants scan to start voting

### Real-Time Updates
- Results refresh every 2-3 seconds
- No need to refresh page manually
- Multiple devices see same data instantly

### Multi-Level Voting
- Participants vote for up to 3 candidates
- Each candidate gets different points based on level:
  - Level 1 = 15 points
  - Level 2 = 10 points
  - Level 3 = 5 points
- Total score calculated automatically

### Statistics
- Total participants and votes
- Most voted candidate
- Points distribution
- Average points per vote

---

## 📱 Using on Multiple Devices

### Same Network (Recommended):
1. Get server IP: `ipconfig` in PowerShell
2. Replace `localhost` with IP: `http://192.168.x.x:3000`
3. Test on phones/tablets on same WiFi

### Remote Access:
1. Use ngrok for tunneling: `ngrok http 3000`
2. Get public URL: `https://xxxx-xx-xxx-xx.ngrok.io`
3. Share URL with participants

---

## 🔧 Common Troubleshooting

### Server won't start
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process on port 3000 (Windows)
taskkill /PID <PID> /F

# Use different port
# Edit server.js: const PORT = 3001;
```

### PHP server error
```powershell
# Test PHP installation
php --version

# Try different port
php -S localhost:8001 -t api/

# Check file permissions
# Data folder needs write access
```

### Can't submit votes
1. Check browser console (F12) for errors
2. Make sure both servers are running
3. Check data folder exists: `c:\Project\TAS-Event-Vote\data\`

---

## 📊 After Event

### Export Results
- All data saved in JSON files in `/data` folder
- You can:
  - Open in text editor
  - Copy to Excel
  - Process with other tools

### Reset Event
1. Go to Admin "Event Settings"
2. Click "⏹️ End Event"
3. Delete `/data/*.json` files to reset
4. Start new event

### Backup Data
Copy `/data` folder before deleting:
```powershell
Copy-Item "c:\Project\TAS-Event-Vote\data" "c:\Backup\event-data" -Recurse
```

---

## 💡 Tips & Tricks

### Test Voting Locally
1. Open http://localhost:3000/vote in different browsers
2. Register with different phone numbers
3. Vote for different candidates
4. See results update in real-time

### Multiple Candidates Test
```
Add these test candidates:
1. Alice - Team Lead
2. Bob - Senior Developer
3. Carol - Designer
4. David - Manager
5. Eva - Marketing
```

### Stress Test
1. Register 10-20 test participants
2. Each votes for 2-3 candidates
3. Results calculate and display instantly

### Print Results
1. Open results page
2. Right-click → Print
3. Select "Save as PDF"

---

## 🎊 Ready to Vote!

Your voting system is now ready to use. Enjoy! 

**Need help?** Check README.md for detailed documentation.

---

## 📞 Quick Reference

| Feature | URL | Access |
|---------|-----|--------|
| Home | http://localhost:3000 | Public |
| Admin Dashboard | http://localhost:3000/admin | Admin |
| Voting | http://localhost:3000/vote | Participants |
| Results | http://localhost:3000/results | Everyone |
| API | http://localhost:3000/api | Backend |

---

**Happy voting! 🗳️**
