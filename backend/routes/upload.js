import express from "express"
import multer from "multer"
import { protect } from "../middleware/auth.js"
import UploadedFile from "../models/UploadedFile.js"

const router = express.Router()

// Keep the file in memory so we can store its bytes in MongoDB (base64).
// Limit 10MB: base64 (+~33%) keeps a single doc safely under Mongo's 16MB cap.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") cb(null, true)
    else cb(new Error("Only image or PDF files are allowed"))
  },
})

// POST /api/upload  -> { file_url }
// Stores the uploaded file inside MongoDB and returns a URL that serves it back.
router.post("/", protect, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" })
    const doc = await UploadedFile.create({
      filename: req.file.originalname,
      content_type: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer.toString("base64"),
    })
    const file_url = `${req.protocol}://${req.get("host")}/api/upload/${doc._id}`
    res.status(201).json({ file_url })
  } catch (err) {
    next(err)
  }
})

// GET /api/upload/:id  -> serves the raw file bytes straight from MongoDB.
// Public on purpose so <img> tags and certificate links work for everyone.
router.get("/:id", async (req, res) => {
  try {
    const doc = await UploadedFile.findById(req.params.id)
    if (!doc) return res.status(404).json({ error: "File not found" })
    const buffer = Buffer.from(doc.data, "base64")
    res.set("Content-Type", doc.content_type || "application/octet-stream")
    res.set("Content-Length", String(buffer.length))
    res.set("Cache-Control", "public, max-age=31536000, immutable")
    return res.send(buffer)
  } catch (err) {
    return res.status(400).json({ error: "Invalid file id" })
  }
})

export default router
