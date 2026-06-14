import express from "express"
import WishlistItem from "../models/WishlistItem.js"
import { protect } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/error.js"
import { runQuery } from "../utils/query.js"

const router = express.Router()

// GET /api/wishlist  (scoped to current user)
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    req.query.user_email = req.user.email
    const items = await runQuery(WishlistItem, req.query)
    res.json(items)
  })
)

// POST /api/wishlist  (idempotent on user+product)
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { product_id } = req.body
    const existing = await WishlistItem.findOne({ user_email: req.user.email, product_id })
    if (existing) return res.status(200).json(existing)
    const item = await WishlistItem.create({ ...req.body, user_email: req.user.email })
    res.status(201).json(item)
  })
)

// DELETE /api/wishlist/:id
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    await WishlistItem.findOneAndDelete({ _id: req.params.id, user_email: req.user.email })
    res.status(204).end()
  })
)

export default router
