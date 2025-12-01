const express = require("express");
const router = express.Router();

const { createToken } = require("../auth/jwt");

router.post("/token", (req, res) => {
  const { userId, roles = ["user"] } = req.body || {};

  if (!userId) return res.status(400).json({ error: "userId required" });

  const token = createToken(userId, roles);

  res.json({ token });
});

module.exports = router;
