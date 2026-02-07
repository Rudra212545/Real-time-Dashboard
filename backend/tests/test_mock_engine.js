// Mock Engine Client - Test Day 1 Implementation
// Simulates TG Engine behavior for testing

const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('[MOCK ENGINE] Starting...');

// Generate engine JWT
const token = jwt.sign(
  { 
    engineId: 'engine_test_01', 
    role: 'engine' 
  },
  process.env.JWT_SECRET,
  { 
    expiresIn: '1h', 
    issuer: 'microbridge.internal' 
  }
);

console.log('[MOCK ENGINE] JWT generated');

// Connect to engine namespace
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const socket = io(BACKEND_URL + '/engine', {
  auth: { token }
});

console.log('[MOCK ENGINE] Connecting to:', BACKEND_URL + '/engine');

socket.on('connect', () => {
  console.log('[MOCK ENGINE] ✅ Connected to backend');
  console.log('[MOCK ENGINE] Socket ID:', socket.id);
  
  // Announce ready
  socket.emit('engine_ready');
  console.log('[MOCK ENGINE] Sent engine_ready');
});

socket.on('ready_ack', (data) => {
  console.log('[MOCK ENGINE] Received ready_ack:', data);
});

socket.on('engine_job', (job) => {
  console.log('\n[MOCK ENGINE] 📦 Received job:');
  console.log('  Job ID:', job.job_id);
  console.log('  Job Type:', job.job_type);
  console.log('  User ID:', job.user_id);
  console.log('  World:', job.world_spec?.world?.name || 'Unknown');
  
  // Simulate job processing
  simulateJobExecution(job);
});

function simulateJobExecution(job) {
  const jobId = job.job_id;
  const jobType = job.job_type;
  
  // Step 1: Job started (500ms delay)
  setTimeout(() => {
    console.log(`[MOCK ENGINE] ▶️  Job ${jobId} started`);
    socket.emit('job_started', {
      job_id: jobId,
      timestamp: Date.now()
    });
  }, 500);
  
  // Step 2: Progress 25% (1.5s delay)
  setTimeout(() => {
    console.log(`[MOCK ENGINE] 📊 Job ${jobId} progress: 25%`);
    socket.emit('job_progress', {
      job_id: jobId,
      progress: 25,
      timestamp: Date.now()
    });
  }, 1500);
  
  // Step 3: Progress 50% (2.5s delay)
  setTimeout(() => {
    console.log(`[MOCK ENGINE] 📊 Job ${jobId} progress: 50%`);
    socket.emit('job_progress', {
      job_id: jobId,
      progress: 50,
      timestamp: Date.now()
    });
  }, 2500);
  
  // Step 4: Progress 75% (3.5s delay)
  setTimeout(() => {
    console.log(`[MOCK ENGINE] 📊 Job ${jobId} progress: 75%`);
    socket.emit('job_progress', {
      job_id: jobId,
      progress: 75,
      timestamp: Date.now()
    });
  }, 3500);
  
  // Step 5: Job completed (4.5s delay)
  setTimeout(() => {
    console.log(`[MOCK ENGINE] ✅ Job ${jobId} completed`);
    socket.emit('job_completed', {
      job_id: jobId,
      result: {
        entities_spawned: jobType === 'SPAWN_ENTITY' ? 1 : 0,
        render_time_ms: 4000,
        job_type: jobType
      },
      timestamp: Date.now()
    });
  }, 4500);
}

// Heartbeat every 5 seconds
socket.on('connect', () => {
  socket.emit('engine_heartbeat');
  setInterval(() => {
    socket.emit('engine_heartbeat');
    console.log('[MOCK ENGINE] 💓 Heartbeat sent');
  }, 5000);
});

socket.on('heartbeat_ack', (data) => {
  console.log('[MOCK ENGINE] Heartbeat acknowledged');
});

socket.on('disconnect', () => {
  console.log('[MOCK ENGINE] ❌ Disconnected from backend');
});

socket.on('connect_error', (err) => {
  console.error('[MOCK ENGINE] ❌ Connection error:', err.message);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[MOCK ENGINE] Shutting down...');
  socket.disconnect();
  process.exit(0);
});

console.log('[MOCK ENGINE] Waiting for connection...');
