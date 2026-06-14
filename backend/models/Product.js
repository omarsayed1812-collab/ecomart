import mongoose from "mongoose"
import { toJSONPlugin } from "../utils/toJSON.js"

const CATEGORIES = [
  "clothing",
  "home",
  "food",
  "beauty",
  "electronics",
  "garden",
  "accessories",
  "cleaning",
]

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    image_url: { type: String, default: "" },
    company_id: { type: String, required: true }, // company user email
    company_name: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    sustainability_score: { type: Number, default: 3, min: 1, max: 5 },
    eco_badges: { type: [String], default: [] },
    carbon_saved_kg: { type: Number, default: 0 },
    // Environmental impact report (filled by company, shown to customers)
    materials: { type: String, default: "" },
    recycled_percentage: { type: Number, default: 0 },
    lifecycle: { type: String, default: "" },
    impact_summary: { type: String, default: "" },
    views: { type: Number, default: 0 },
    orders_count: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "draft", "out_of_stock"], default: "active" },
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
)

toJSONPlugin(productSchema)

export const PRODUCT_CATEGORIES = CATEGORIES
export default mongoose.model("Product", productSchema)
