import mongoose from "mongoose"

// Stores uploaded files (images, certificates, PDFs) directly inside MongoDB
// as base64 text. We only expose the bytes through GET /api/upload/:id, so we
// intentionally do NOT attach toJSONPlugin (we never serialize `data`).
const uploadedFileSchema = new mongoose.Schema(
  {
    filename: { type: String, default: "" },
    content_type: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    data: { type: String, required: true }, // base64-encoded file contents
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
)

export default mongoose.model("UploadedFile", uploadedFileSchema)
