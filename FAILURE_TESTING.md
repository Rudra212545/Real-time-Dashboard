# Failure Testing Quick Guide

## Quick Test Commands

### 1. Engine Disconnect (via API)

```bash
# Get admin token first
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Disconnect engine
curl -X POST http://localhost:3000/engine/disconnect \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Reconnect engine
curl -X POST http://localhost:3000/engine/reconnect \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Bad Asset Test (via Frontend)

In the dashboard, submit a world with these entity components:
```json
{
  "components": { "mesh": "corrupted_mesh" },
  "material": { "texture": "missing_texture.png" }
}
```

### 3. Invalid Entity Test

Submit entity with ID containing "invalid":
```json
{
  "id": "invalid_player_999"
}
```

Or submit entity without transform:
```json
{
  "id": "player_1",
  "type": "player"
  // Missing transform
}
```

### 4. Run Automated Tests

```bash
cd backend
node test_failures.js
```

## Expected UI Behavior

- ✅ **Queued:** Blue dot, "QUEUED" badge
- 🟡 **Started:** Amber dot, "STARTED" badge  
- ✅ **Finished:** Green dot, "FINISHED" badge
- ❌ **Failed:** Red dot, "FAILED" badge + error message

## Telemetry Check

```bash
# View telemetry log
cat backend/telemetry_samples.json | grep JOB_FAILED
```

## Screenshots Checklist

- [ ] Normal job flow (all green)
- [ ] Failed job with BAD_ASSET error
- [ ] Failed job with INVALID_ENTITY error
- [ ] Failed job with ENGINE_DISCONNECTED error
- [ ] Mixed status (queued, started, finished, failed)
- [ ] Telemetry log showing JOB_FAILED events
