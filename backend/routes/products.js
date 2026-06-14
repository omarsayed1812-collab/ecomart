import express from "express"
import Product from "../models/Product.js"
import { protect, adminOnly } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/error.js"
import { runQuery } from "../utils/query.js"

const router = express.Router()

// GET /api/products?status=active&sort=-created_date&limit=8
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const products = await runQuery(Product, req.query)
    res.json(products)
  })
)

// GET /api/products/:id
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: "Product not found" })
    res.json(product)
  })
)

// PATCH /api/products/:id
// Customers may only increment the view counter; everything else is admin-only.
router.patch(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: "Product not found" })

    const keys = Object.keys(req.body)
    const isViewOnly = keys.length === 1 && keys[0] === "views"

    if (!isViewOnly && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can edit products directly" })
    }

    Object.assign(product, req.body)
    await product.save()
    res.json(product)
  })
)

// POST /api/products  (admin only — normally created via product-request approval)
router.post(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  })
)

// DELETE /api/products/:id  (admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id)
    res.status(204).end()
  })
)

export default router
