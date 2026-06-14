import mongoose from "mongoose"
import { toJSONPlugin } from "../utils/toJSON.js"

const cartItemSchema = new mongoose.Schema(
  {
    user_email: { type: String, required: true },
    product_id: { type: String, required: true },
    title: { type: String, default: "" },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    image_url: { type: String, default: "" },
    company_id: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
)

cartItemSchema.index({ user_email: 1, product_id: 1 }, { unique: true })

toJSONPlugin(cartItemSchema)

export default mongoose.model("CartItem", cartItemSchema)
