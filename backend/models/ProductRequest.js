import mongoose from "mongoose"
import { toJSONPlugin } from "../utils/toJSON.js"

const productRequestSchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true }, // company user email
    company_name: { type: String, default: "" },
    request_type: { type: String, enum: ["add", "edit", "delete"], required: true },
    product_id: { type: String, default: null }, // for edit/delete
    product_data: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    admin_note: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
)

toJSONPlugin(productRequestSchema)

export default mongoose.model("ProductRequest", productRequestSchema)
