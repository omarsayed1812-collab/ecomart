import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { protect } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/error.js"

const router = express.Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  })

// POST /api/auth/register
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { full_name, email, password } = req.body
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "full_name, email and password are required" })
    }
    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(409).json({ error: "Email already registered" })

    const user = await User.create({ full_name, email, password })
    const token = signToken(user.id)
    res.status(201).json({ token, user: user.toJSON() })
  })
)

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" })
    }
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    const token = signToken(user.id)
    res.json({ token, user: user.toJSON() })
  })
)

// GET /api/auth/me
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json(req.user.toJSON())
  })
)

// PATCH /api/auth/me  (update custom fields like account_type)
router.patch(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const allowed = ["account_type", "full_name"]
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field]
    })
    await req.user.save()
    res.json(req.user.toJSON())
  })
)

export default router
