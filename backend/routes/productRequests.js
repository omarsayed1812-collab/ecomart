import express from "express"
import ProductRequest from "../models/ProductRequest.js"
import Product from "../models/Product.js"
import { protect, adminOnly } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/error.js"
import { runQuery } from "../utils/query.js"

const router = express.Router()

// GET /api/product-requests  (admin sees all; company sees own)
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      req.query.company_id = req.user.email
    }
    const requests = await runQuery(ProductRequest, req.query)
    res.json(requests)
  })
)

// POST /api/product-requests  (company submits a change request)
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const request = await ProductRequest.create({
      ...req.body,
      company_id: req.user.email,
      company_name: req.body.company_name || req.user.full_name,
      status: "pending",
    })
    res.status(201).json(request)
  })
)

// PATCH /api/product-requests/:id  (admin approves / rejects + executes action)
router.patch(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const request = await ProductRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ error: "Request not found" })

    const { status, admin_note } = req.body
    if (admin_note !== undefined) request.admin_note = admin_note

    if (status === "approved" && request.status !== "approved") {
      const data = request.product_data || {}
      if (request.request_type === "add") {
        await Product.create({
          ...data,
          company_id: request.company_id,
          company_name: request.company_name,
        })
      } else if (request.request_type === "edit" && request.product_id) {
        await Product.findByIdAndUpdate(request.product_id, data, { new: true })
      } else if (request.request_type === "delete" && request.product_id) {
        await Product.findByIdAndDelete(request.product_id)
      }
      request.status = "approved"
    } else if (status) {
      request.status = status
    }

    await request.save()
    res.json(request)
  })
)

export default router
