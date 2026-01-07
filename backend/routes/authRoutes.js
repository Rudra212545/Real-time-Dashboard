const express = require("express");
const router = express.Router();

const { createToken } = require("../auth/jwt");

router.post("/token", (req, res) => {
  const { userId } = req.body || {};

  if (!userId) return res.status(400).json({ error: "userId required" });

  // TEMPORARY role assignment 
  let role = "user";

  // Example: simple admin allowlist
  const ADMIN_USERS = ["admin", "testadmin", "root"];

  if (ADMIN_USERS.includes(userId)) {
    role = "admin";
  }

  const token = createToken(userId, [role]);

  res.json({ token });
});

module.exports = router;
