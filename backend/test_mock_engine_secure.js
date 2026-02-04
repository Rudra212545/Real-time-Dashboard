require('dotenv').config();
const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ENGINE_SHARED_SECRET = process.env.ENGINE_SHARED_SECRET || 'engine_secret_key_2024';
const JWT_SECRET = process.env.JWT_SECRET;

const engineToken = jwt.sign(
  { engineId: 'mock_engine_01', role: 'engine' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('🚀 Mock Engine (with security) starting...\n');

const socket = io('http://localhost:3000/engine', {
  auth: { token: engineToken }
});

function signMessage(payload) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const ts = Date.now();
  const sig = crypto
    .createHmac('sha256', ENGINE_SHARED_SECRET)
    .update(JSON.stringify(payload) + nonce + ts)
    .digest('hex');
  
  return { payload, nonce, ts, sig };
}

socket.on('connect', () => {
  console.log('✅ Engine connected');
  
  // Send ready signal
  socket.emit('engine_ready');
  
  // Heartbeat every 3 seconds
  setInterval(() => {
    socket.emit('engine_heartbeat');
  }, 3000);
});

socket.on('engine_job', (job) => {
  console.log(`\n📦 Received job: ${job.job_id} (${job.job_type})`);
  
  const jobId = job.job_id;
  
  // Send ack
  const ackMsg = signMessage({ jobId, status: 'received' });
  socket.emit('job_ack', ackMsg);
  
  // Simulate processing
  setTimeout(() => {
    const startMsg = signMessage({ job_id: jobId, timestamp: Date.now() });
    socket.emit('job_started', startMsg);
    console.log(`  ⚙️  Job started: ${jobId}`);
  }, 500);
  
  setTimeout(() => {
    const progressMsg = signMessage({ job_id: jobId, progress: 50, timestamp: Date.now() });
    socket.emit('job_progress', progressMsg);
    console.log(`  📊 Progress: 50%`);
  }, 1500);
  
  setTimeout(() => {
    const completeMsg = signMessage({ 
      job_id: jobId, 
      result: { success: true },
      timestamp: Date.now() 
    });
    socket.emit('job_completed', completeMsg);
    console.log(`  ✅ Job completed: ${jobId}`);
  }, 2500);
});

socket.on('ready_ack', () => {
  console.log('✅ Ready acknowledged by bridge');
});

socket.on('heartbeat_ack', () => {
  console.log('💓 Heartbeat ack');
});

socket.on('status_ack', (data) => {
  console.log(`✅ Status ack: ${data.jobId}`);
});

socket.on('ack_received', (data) => {
  console.log(`✅ Ack received: ${data.jobId}`);
});

socket.on('disconnect', () => {
  console.log('❌ Engine disconnected');
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
});

console.log('Waiting for jobs...\n');
