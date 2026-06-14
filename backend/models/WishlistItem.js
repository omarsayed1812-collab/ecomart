import mongoose from "mongoose"
import { toJSONPlugin } from "../utils/toJSON.js"

const wishlistItemSchema = new mongoose.Schema(
  {
    user_email: { type: String, required: true },
    product_id: { type: String, required: true },
    title: { type: String, default: "" },
    price: { type: Number, default: 0 },
    image_url: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
)

wishlistItemSchema.index({ user_email: 1, product_id: 1 }, { unique: true })

toJSONPlugin(wishlistItemSchema)

export default mongoose.model("WishlistItem", wishlistItemSchema)
