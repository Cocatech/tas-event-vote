# TAS Event Vote System

## 📋 Project Overview
A comprehensive online voting system for events with real-time results, QR code registration, and multi-level voting.

### Features:
- ✅ **Event Setup**: Configure event name, max participants, and manage candidates
- ✅ **QR Code Registration**: Scan QR code to register and start voting
- ✅ **Multi-Level Voting**: Vote for candidates at 3 different levels (15, 10, 5 points)
- ✅ **Real-Time Results**: Live leaderboard with instant updates
- ✅ **Admin Dashboard**: Manage candidates, monitor participants, and view analytics
- ✅ **Beautiful UI**: Modern design with TailwindCSS
- ✅ **JSON Data Storage**: No database required, all data stored as JSON

---

## 🛠️ Technology Stack

### Backend:
- **PHP 7.4+**: RESTful API for data management
- **JSON Files**: Data persistence (no SQL database)

### Frontend:
- **HTML5**: Semantic markup
- **JavaScript (ES6+)**: Interactive functionality
- **TailwindCSS**: Beautiful, responsive styling
- **Chart.js**: Real-time visualizations

### Server:
- **Node.js + Express**: Frontend server and API proxy
- **CORS**: Cross-origin resource sharing

---

## 🐳 Docker Installation & Deployment

### Quick Start (Recommended)

**This project is fully containerized with Docker.** All services run in isolated containers with automatic setup.

#### Option 1: Proxmox Deployment (Production)

1. **Create Ubuntu 22.04 VM on Proxmox**
   - Specs: 2GB RAM, 2 CPU cores, 20GB storage
   - Use live-server ISO

2. **Run Automated Setup Script**
   ```bash
   sudo bash <(curl -fsSL https://raw.githubusercontent.com/Cocatech/tas-event-vote/main/setup-ubuntu.sh)
   ```
   - Enter Cloudflare Tunnel token when prompted
   - Script installs Docker, clones repo, starts containers
   - System will be live at: **https://vote.tas-c.com**

#### Option 2: Local Docker Deployment

**Prerequisites:**
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose

**Installation:**

1. **Clone Repository**
   ```bash
   git clone https://github.com/Cocatech/tas-event-vote.git
   cd tas-event-vote
   ```

2. **Create Environment File**
   ```bash
   # Create .env file with your Cloudflare token
   echo "CLOUDFLARE_TOKEN=your-token-here" > .env
   ```
   
   Or edit `.env` directly:
   ```
   CLOUDFLARE_TOKEN=eyJhIjoiODgyZDBi...
   ```

3. **Start Services**
   ```bash
   docker compose up -d
   ```

4. **Verify Installation**
   ```bash
   # Check all containers are running
   docker compose ps
   
   # Test health endpoint
   curl http://localhost/health
   ```

5. **Access System**
   - **Home**: http://localhost
   - **Admin Dashboard**: http://localhost/admin (password: tas2024)
   - **Voting Page**: http://localhost/vote
   - **Results Page**: http://localhost/results.html
   - **Public Access**: https://vote.tas-c.com (if Cloudflare connected)

### Docker Services Architecture

```
┌─────────────────────────────────────────────┐
│        Cloudflare Tunnel (Public)           │
│      vote.tas-c.com ←→ HTTPS               │
└────────────────┬────────────────────────────┘
                 │
        ┌────────▼──────────┐
        │   Nginx (Port 80) │
        │  Reverse Proxy    │
        └────────┬──────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────┐  ┌───▼────┐  ┌──▼─────┐
│Frontend │  │ PHP API│  │ (Data) │
│Node.js  │  │Port    │  │ Volume │
│Port 3000│  │8000    │  │        │
└─────────┘  └────────┘  └────────┘
```

### Useful Docker Commands

```bash
# View all container logs
docker compose logs -f

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Start services
docker compose up -d

# View container status
docker compose ps

# Access container shell
docker exec -it tas-event-vote-api bash

# Clear all data (WARNING!)
docker compose down -v
```

### Environment Variables

The `.env` file contains:
- `CLOUDFLARE_TOKEN`: Your Cloudflare Tunnel authentication token

All containers automatically configured for:
- **Timezone**: Bangkok (GMT+7)
- **Cache**: Disabled (no-cache headers)
- **Network**: Internal Docker network

---

## 📦 Legacy Installation (Local Development)

For local development without Docker:

### Prerequisites:
- Node.js 18+
- PHP 8.1+
- Git

### Setup:

```bash
# 1. Install Node dependencies
npm install

# 2. Start PHP API (Terminal 1)
php -S localhost:8000 -t api/

# 3. Start Node.js server (Terminal 2)
npm start

# 4. Access at http://localhost:3000
```

---

## 🎯 Usage Guide

### For Event Organizers (Admin Dashboard)

1. **Setup Event** (`/admin`)
   - Click "Event Settings" in sidebar
   - Configure event name, max participants
   - Save settings and start the event

2. **Add Candidates**
   - Click "Manage Candidates" in sidebar
   - Enter candidate name and description
   - Click "Add Candidate"
   - Candidates appear as voting options

3. **Generate QR Code**
   - QR code is automatically generated in Event Settings
   - Download QR code for printing or display
   - Participants scan to start voting

4. **Monitor Live**
   - Click "Control & Monitor" to see registered participants
   - Click "Live Results" for real-time leaderboard
   - Results update automatically every 2-3 seconds

### For Voters (Voting Page)

1. **Register**
   - Scan QR code or visit `/vote`
   - Enter name and phone number
   - Click "Register & Start Voting"

2. **Vote**
   - See all candidates displayed
   - Choose voting level (🥇 Level 1 = 15pts, 🥈 Level 2 = 10pts, 🥉 Level 3 = 5pts)
   - Can vote for multiple candidates at different levels
   - Click "Submit Your Votes" when done

3. **View Results**
   - Click "View Live Results" after voting
   - See real-time leaderboard and rankings
   - Podium shows top 3 candidates

---

## 📁 Project Structure

```
TAS-Event-Vote/
├── api/
│   ├── config.php           # Configuration & helpers
│   └── index.php            # Main API endpoints
├── data/                    # JSON data files (auto-generated)
│   ├── event.json
│   ├── candidates.json
│   ├── participants.json
│   └── votes.json
├── public/
│   ├── index.html           # Home page
│   ├── admin.html           # Admin dashboard
│   ├── vote.html            # Voting page
│   ├── results.html         # Results page
│   ├── js/
│   │   ├── admin.js         # Admin dashboard logic
│   │   ├── vote.js          # Voting page logic
│   │   └── results.js       # Results page logic
│   ├── css/                 # Custom CSS (optional)
│   └── lib/                 # Libraries
├── server.js                # Node.js server
├── package.json             # Dependencies
└── README.md                # This file
```

---

## 🔧 API Endpoints

### Event Management
- `GET /api/event` - Get event info
- `PUT /api/event` - Update event settings
- `PUT /api/event-status` - Change event status (setup/running/closed)

### Candidates
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Add new candidate
- `PUT /api/candidates/{id}` - Update candidate
- `DELETE /api/candidates/{id}` - Delete candidate

### Participants
- `GET /api/participants` - Get all participants
- `POST /api/participants` - Register new participant

### Votes
- `GET /api/votes` - Get all votes
- `POST /api/votes` - Submit a vote

### Results
- `GET /api/results` - Get results with top 3 candidates

### Admin
- `POST /api/reset-event` - Reset all event data

---

## 💾 Data Files Format

### event.json
```json
{
  "name": "Event Name",
  "max_participants": 100,
  "description": "Event Description",
  "status": "running",
  "created_at": "2024-12-03 10:00:00"
}
```

### candidates.json
```json
[
  {
    "id": "65xyz123",
    "name": "Candidate Name",
    "description": "Position/Role",
    "order": 1,
    "created_at": "2024-12-03 10:00:00"
  }
]
```

### participants.json
```json
[
  {
    "id": "65abc456",
    "name": "Voter Name",
    "phone": "0812345678",
    "email": "voter@email.com",
    "token": "abc123def456...",
    "created_at": "2024-12-03 10:05:00",
    "voted_at": "2024-12-03 10:06:00"
  }
]
```

### votes.json
```json
[
  {
    "id": "65vote789",
    "participant_id": "65abc456",
    "candidate_id": "65xyz123",
    "level": 1,
    "points": 15,
    "created_at": "2024-12-03 10:06:00"
  }
]
```

---

## 🎨 Customization

### Change Colors
Open CSS files in `/public` and modify:
- `from-blue-600` → `from-purple-600` (TailwindCSS colors)
- `to-indigo-700` → `to-pink-700`

### Change Points Values
Edit `api/config.php` function `getPointsByLevel()`:
```php
function getPointsByLevel($level) {
    $points = [1 => 20, 2 => 15, 3 => 10]; // Custom points
    return $points[$level] ?? 0;
}
```

### Add More Voting Levels
Modify voting buttons in `vote.html` and adjust point values in PHP API.

---

## 🐛 Troubleshooting

### "API Server Error"
- Ensure PHP server is running on localhost:8000
- Check PHP version: `php --version`
- Verify `api/` folder path is correct

### QR Code not displaying
- The QR code uses api.qrserver.com
- Ensure internet connection is available
- Try manual URL: `http://localhost:3000/vote`

### Votes not saving
- Check `data/` folder exists and is writable
- Verify all JSON files are created: `data/*.json`
- Check browser console for errors (F12)

### Port already in use
- PHP: `php -S localhost:8001 -t api/`
- Node: Modify PORT in `server.js`

---

## 📊 Dashboard Features

### Admin Dashboard
- **Event Settings**: Configure event details
- **Manage Candidates**: Add/edit/delete candidates
- **Control & Monitor**: See registered participants and voting status
- **Live Results**: Real-time leaderboard with charts

### Voting Page
- **Registration**: Phone number based registration
- **Multi-Level Voting**: 3 priority levels for each candidate
- **Instant Feedback**: Visual confirmation of votes
- **Success Message**: Thank you page with results link

### Results Page
- **Podium**: Animated top 3 candidates
- **Full Rankings**: All candidates sorted by points
- **Statistics**: Vote counts and point distribution
- **Charts**: Bar and pie charts for visualization

---

## 🔐 Security Notes

### Current Implementation:
- Uses simple token-based authentication
- Phone number uniqueness check for registration
- Vote prevents duplicate voting per candidate per voter
- CORS enabled for development

### For Production:
- Implement proper JWT authentication
- Add password protection for admin dashboard
- Use HTTPS for data transmission
- Validate all inputs on server side
- Implement rate limiting
- Add backup system for JSON files

---

## 🚀 Deployment

### Using Apache/PHP Hosting:
1. Upload `/api` folder to hosting
2. Upload `/public` folder to hosting
3. Point domain to `/public` folder
4. Create `/data` folder with write permissions (chmod 755)

### Using Node.js Hosting (Heroku, Railway, etc.):
1. Configure environment variables
2. Modify API_BASE URL in JavaScript files
3. Deploy using git or CLI
4. Ensure PHP API is also hosted

---

## 📝 License
MIT License - Feel free to use and modify

---

## 👨‍💻 Support
For issues or questions, check:
1. Browser console (F12) for errors
2. Server logs in terminal
3. Data folder for generated JSON files
4. Verify all servers are running

---

## 🎉 Features Implemented
✅ Event configuration
✅ Candidate management
✅ QR code generation
✅ Participant registration
✅ Multi-level voting (3 levels, 15/10/5 points)
✅ Real-time results
✅ Live leaderboard
✅ Admin dashboard
✅ Beautiful TailwindCSS UI
✅ No SQL database (JSON storage)
✅ Responsive design
✅ Auto-refresh results
✅ Charts and statistics

---

**Enjoy your event voting! 🎊**
