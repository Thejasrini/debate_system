import express from "express";
import { User } from "../models/User.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Registers a new user and returns JWT access & refresh tokens
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long."
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        error: "Email already registered."
      });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    await user.save();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    return res.status(500).json({ error: "Registration failed. " + err.message });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticates user credentials and returns JWT tokens
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required."
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    return res.status(500).json({ error: "Authentication failed." });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Issues a new access token using a valid refresh token
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token is required."
      });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.type !== "refresh") {
      return res.status(401).json({
        error: "Invalid refresh token."
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "User no longer exists."
      });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    return res.status(200).json({
      accessToken: newAccessToken
    });
  } catch (err) {
    console.warn("⚠️ Token refresh warning:", err.message);
    return res.status(401).json({
      error: "Invalid or expired refresh token."
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Returns current authenticated user profile
 */
router.get("/me", protect, async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
});

export default router;
