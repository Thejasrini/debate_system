import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

/**
 * Express middleware to protect routes via Bearer JWT token authentication.
 * Returns 401 if token is missing or invalid.
 */
export async function protect(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      error: "Authentication required. Please log in."
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "User no longer exists."
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.warn("⚠️ Auth protection warning:", err.message);
    return res.status(401).json({
      error: "Invalid or expired token."
    });
  }
}

/**
 * Express middleware for optional authentication.
 * Attaches req.user if a valid token is present, but allows guest access if no token is provided.
 */
export async function optionalProtect(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    req.user = null; // Guest user
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select("-password");
    req.user = user || null;
  } catch (err) {
    req.user = null; // Fallback to guest if token expired or invalid
  }

  next();
}

/**
 * Express middleware to restrict access to admin users only.
 */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin access required."
    });
  }
  next();
}
