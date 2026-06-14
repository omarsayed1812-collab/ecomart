import express from "express"
import CompanyApplication from "../models/CompanyApplication.js"
import User from "../models/User.js"
import { protect, adminOnly } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/error.js"
import { runQuery } from "../utils/query.js"

const router = express.Router()

// GET /api/company-applications  (admin sees all; user sees own)
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      req.query.user_email = req.user.email
    }
    const apps = await runQuery(CompanyApplication, req.query)
    res.json(apps)
  })
)

// POST /api/company-applications
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const existing = await CompanyApplication.findOne({ user_email: req.user.email })
    if (existing) {
      return res.status(409).json({ error: "You already submitted an application" })
    }
    const app = await CompanyApplication.create({
      ...req.body,
      user_email: req.user.email,
      user_name: req.user.full_name,
      status: "pending",
    })
    res.status(201).json(app)
  })
)

// PATCH /api/company-applications/:id  (admin approves / rejects)
router.patch(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const app = await CompanyApplication.findById(req.params.id)
    if (!app) return res.status(404).json({ error: "Application not found" })

    const { status, admin_note } = req.body
    if (status) app.status = status
    if (admin_note !== undefined) app.admin_note = admin_note
    await app.save()

    // On approval, promote the applicant to a company account
    if (status === "approved") {
      const user = await User.findOne({ email: app.user_email })
      if (user) {
        user.account_type = "company"
        await user.save()
      }
    }

    res.json(app)
  })
)

export default router
