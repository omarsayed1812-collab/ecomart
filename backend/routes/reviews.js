import express from "express"
import Review from "../models/Review.js"
import { protect } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/error.js"
import { runQuery } from "../utils/query.js"

const router = express.Router()

// GET /api/reviews  (filter by product_id, etc.)
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const reviews = await runQuery(Review, req.query)
    res.json(reviews)
  })
)

// POST /api/reviews  (logged-in customer leaves a rating + comment)
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { product_id, rating, comment } = req.body
    if (!product_id || !rating) {
      return res.status(400).json({ error: "product_id and rating are required" })
    }
    const review = await Review.create({
      product_id,
      rating,
      comment: comment || "",
      customer_email: req.user.email,
      customer_name: req.user.full_name,
    })
    res.status(201).json(review)
  })
)

// DELETE /api/reviews/:id  (owner or admin)
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: "Review not found" })
    if (req.user.role !== "admin" && review.customer_email !== req.user.email) {
      return res.status(403).json({ error: "Not allowed" })
    }
    await review.deleteOne()
    res.status(204).end()
  })
)

export default router
