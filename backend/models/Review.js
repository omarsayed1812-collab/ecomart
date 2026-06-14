import mongoose from "mongoose"
import { toJSONPlugin } from "../utils/toJSON.js"

const reviewSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_name: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
)

toJSONPlugin(reviewSchema)

export default mongoose.model("Review", reviewSchema)
