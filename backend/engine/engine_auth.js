const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// In-memory nonce store 
const usedNonces = new Set();


//   1. Verify Engine JWT

function verifyEngineJWT(socket) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    throw new Error("ENGINE_JWT_MISSING");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("ENGINE_JWT_INVALID");
  }

  if (payload.role !== "engine") {
    throw new Error("ENGINE_ROLE_INVALID");
  }

  // Attach identity to socket
  socket.engineId = payload.engineId;
}


//   2. Verify Engine Packet Signature (HMAC)

function verifyEngineSignature({ payload, nonce, sig }) {
  if (!payload || !nonce || !sig) {
    throw new Error("ENGINE_PACKET_INCOMPLETE");
  }

  const expectedSig = crypto
    .createHmac("sha256", process.env.ENGINE_SHARED_SECRET)
    .update(JSON.stringify(payload) + nonce)
    .digest("hex");

  if (expectedSig !== sig) {
    throw new Error("ENGINE_SIGNATURE_INVALID");
  }
}


//   3. Verify & consume nonce (replay protection)

function verifyAndConsumeNonce(nonce) {
  if (usedNonces.has(nonce)) {
    throw new Error("ENGINE_NONCE_REPLAY");
  }
  usedNonces.add(nonce);
}

module.exports = {
  verifyEngineJWT,
  verifyEngineSignature,
  verifyAndConsumeNonce
};
