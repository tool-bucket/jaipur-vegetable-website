
const jwt = require("jsonwebtoken");

function createToken() {
  return jwt.sign(
    { role: "admin", email: process.env.ADMIN_EMAIL },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Admin login required." });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired admin session." });
  }
}

module.exports = { createToken, requireAdmin };
