# RUN.md — Quick Start Guide

**System**: Real-Time Micro-Bridge + Multi-Agent Orchestrator  


---

## 🚀 One-Command Startup (Recommended)

### Windows
```bash
start.bat
```

### Mac/Linux
```bash
chmod +x start.sh
./start.sh
```

**What it does**:
1. Checks Node.js installation (v18+ required)
2. Installs backend dependencies (if needed)
3. Installs frontend dependencies (if needed)
4. Creates `.env` files from examples
5. Starts backend server (port 3000)
6. Starts frontend server (port 5173)
7. Opens dashboard in browser

**URLs**:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

---

## 📋 Prerequisites

### Required
- **Node.js v18+** ([Download](https://nodejs.org))
- **npm v9+** (comes with Node.js)

### Verify Installation
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show v9.x.x or higher
```

---

## 🔧 Manual Setup (Alternative)

If you prefer manual control or the startup script fails:

### Step 1: Clone Repository
```bash
git clone https://github.com/Rudra212545/Real-time-Dashboard.git
cd Real-Time-Micro-Bridge
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend runs at: `http://localhost:3000`

### Step 3: Frontend Setup
Open a **new terminal** (keep backend running):
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## ⚙️ Configuration

### Backend Configuration
**File**: `backend/.env`

```env
# JWT Authentication
JWT_SECRET=microbridge_jwt_secret_dev_12345
JWT_ISSUER=microbridge.internal
JWT_EXP=1h

# Action Signatures
HMAC_SECRET=HMAC_SECRET_987654321
HMAC_WINDOW_MS=15000

# Agent Secrets
HINT_AGENT_SECRET=hint_agent_secret_abc123
NAV_AGENT_SECRET=nav_agent_secret_def456
PREDICT_AGENT_SECRET=predict_agent_secret_ghi789
RULE_AGENT_SECRET=rule_agent_secret_jkl012

# Engine Integration
ENGINE_SHARED_SECRET=engine_shared_secret_mno345

# Server
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

**Important**: Change secrets in production!

### Frontend Configuration
**File**: `frontend/.env` (optional)

```env
VITE_API_URL=http://localhost:3000
```

---

## 🎯 System Usage

### 1. Open Dashboard
Navigate to `http://localhost:5173` in your browser.

### 2. Demo Mode (Quickest Way)
- Locate the **Demo Mode** panel
- Click **"Launch Demo"**
- Watch the full pipeline execute:
  - Random world generation
  - Job queue processing
  - Engine simulation
  - Preview update

### 3. Manual World Generation
- Open **JSON Config Panel**
- Select a sample world (Forest, Desert, Ocean, Volcano)
- Click **"Generate World"**
- Watch jobs in **Job Queue Panel**
- See preview update in **Cube Preview**

### 4. Multi-User Testing
- Open multiple browser tabs
- Each tab = separate user
- Watch **Presence Panel** update
- Trigger actions in different tabs
- Observe agent reactions

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1738742400000
}
```

### Security Status
```bash
curl http://localhost:3000/security/status
```

### Telemetry Replay
```bash
cd backend
node test_telemetry_replay.js
```

### Failure Simulation
```bash
cd backend
node test_failures.js
```

---

## 🐛 Troubleshooting

### Port Already in Use
**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Or change port in `backend/.env`:
```env
PORT=3001
```

### Socket Connection Failed
**Error**: `WebSocket connection failed`

**Solution**:
1. Ensure backend is running first
2. Check backend console for errors
3. Verify `FRONTEND_ORIGIN` in `backend/.env` matches frontend URL

### JWT Authentication Failed
**Error**: `JWT verification failed`

**Solution**:
1. Check `JWT_SECRET` in `backend/.env`
2. Clear browser localStorage
3. Refresh page

### Dependencies Installation Failed
**Error**: `npm install` fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Frontend Not Loading
**Error**: Blank page or build errors

**Solution**:
```bash
cd frontend
rm -rf node_modules .vite
npm install
npm run dev
```

---

## 📦 Project Structure

```
Real-Time-Micro-Bridge/
├── backend/
│   ├── agents/              # Multi-agent logic
│   ├── auth/                # JWT & signatures
│   ├── engine/              # Engine integration
│   ├── security/            # Nonce, heartbeat
│   ├── telemetry/           # Behaviour tracking
│   ├── .env.example         # Config template
│   ├── index.js             # Entry point
│   ├── socket.js            # Socket.IO handlers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── data/            # Sample worlds
│   │   ├── hooks/           # Custom hooks
│   │   └── socket/          # Socket client
│   ├── .env.example
│   └── package.json
├── docs/                    # Documentation
├── start.bat                # Windows startup
├── start.sh                 # Mac/Linux startup
├── RUN.md                   # This file
└── README.md                # Project overview
```

---

## 🔄 Development Workflow

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite hot reload
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build
npm run preview  # Test production build

# Backend
cd backend
NODE_ENV=production npm start
```

---

## 🚀 Deployment

### Environment Variables
**Production**: Set secure values for:
- `JWT_SECRET` (use strong random string)
- `HMAC_SECRET` (use strong random string)
- All agent secrets (unique per agent)
- `ENGINE_SHARED_SECRET` (coordinate with engine team)

### Process Manager (PM2)
```bash
npm install -g pm2

# Backend
cd backend
pm2 start index.js --name microbridge-backend

# Frontend (after build)
cd frontend
pm2 serve dist 5173 --name microbridge-frontend
```



---

## 📊 Monitoring

### Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Telemetry
tail -f backend/telemetry_samples.json

# Engine events
tail -f backend/engine/engine_event_log.json
```

### Health Endpoints
- `GET /health` - Service status
- `GET /security/status` - Security config

---

## 🔗 Quick Links

- **README.md** - Project overview
- **docs/handover.md** - Complete handover guide
- **docs/architecture.md** - System architecture
- **docs/security_readiness.md** - Security details
- **docs/demo_mode.md** - Demo mode guide
- **docs/failure_simulation_report.md** - Failure handling

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend running at `http://localhost:3000`
- [ ] Frontend running at `http://localhost:5173`
- [ ] Dashboard loads in browser
- [ ] Demo Mode button works
- [ ] Job Queue shows jobs
- [ ] Cube Preview updates
- [ ] No console errors
- [ ] Health endpoint responds

---

**System Ready!** 🎉

For questions, check `docs/handover.md` or open an issue.