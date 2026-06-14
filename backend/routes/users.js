import express from "express"
import User from "../models/User.js"
import { protect, adminOnly } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/error.js"
import { runQuery } from "../utils/query.js"

const router = express.Router()

// GET /api/users  (admin only)
router.get(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const users = await runQuery(User, req.query)
    res.json(users)
  })
)

// PATCH /api/users/:id  (admin only — e.g. approve company)
router.patch(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const allowed = ["account_type", "role"]
    const update = {}
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field]
    })
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json(user)
  })
)

export default router
