# 🐳 Docker Quick Start - 2 Minutes

## Fastest Way to Start

### Windows
```bash
cd c:\Project\TAS-Event-Vote
docker-setup.bat
docker-compose up
```

### Mac/Linux
```bash
cd ~/Project/TAS-Event-Vote
chmod +x docker-setup.sh
./docker-setup.sh
docker-compose up
```

---

## Open in Browser

```
Admin:    http://localhost:3000/admin
Vote:     http://localhost:3000/vote
Results:  http://localhost:3000/results
```

---

## Stop Services

```bash
Ctrl+C in terminal
# or
docker-compose down
```

---

## Common Commands

```bash
# Start
docker-compose up

# Start in background
docker-compose up -d

# Stop
docker-compose stop

# View logs
docker-compose logs -f

# Remove containers
docker-compose down
```

---

## What Happens?

✅ Downloads PHP 8.1 image
✅ Downloads Node 18 image  
✅ Installs dependencies
✅ Creates 2 containers
✅ Starts both services
✅ Everything ready in 2 minutes!

---

**That's it! Your system is running.** 🚀

See `DOCKER_SETUP.md` for more options.
