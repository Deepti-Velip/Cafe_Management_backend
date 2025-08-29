import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = verifyToken(token);

    // find the user from DB
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // check access field
    if (!user.access) {
      return res.status(403).json({ message: "Access denied. Contact admin." });
    }

    req.user = user; // attach full user to req for later use
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Optional role-based middleware
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
