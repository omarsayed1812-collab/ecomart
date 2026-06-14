import express from "express"
import CartItem from "../models/CartItem.js"
import { protect } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/error.js"
import { runQuery } from "../utils/query.js"

const router = express.Router()

// GET /api/cart  (always scoped to current user)
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    req.query.user_email = req.user.email
    const items = await runQuery(CartItem, req.query)
    res.json(items)
  })
)

// POST /api/cart  (dedupes by user+product, increments quantity)
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { product_id, quantity = 1 } = req.body
    const existing = await CartItem.findOne({ user_email: req.user.email, product_id })
    if (existing) {
      existing.quantity += quantity
      await existing.save()
      return res.status(200).json(existing)
    }
    const item = await CartItem.create({
      ...req.body,
      user_email: req.user.email,
      quantity,
    })
    res.status(201).json(item)
  })
)

// PATCH /api/cart/:id
router.patch(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const item = await CartItem.findOne({ _id: req.params.id, user_email: req.user.email })
    if (!item) return res.status(404).json({ error: "Cart item not found" })
    if (req.body.quantity !== undefined) {
      item.quantity = Math.max(1, req.body.quantity)
    }
    await item.save()
    res.json(item)
  })
)

// DELETE /api/cart/:id
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    await CartItem.findOneAndDelete({ _id: req.params.id, user_email: req.user.email })
    res.status(204).end()
  })
)

export default router
