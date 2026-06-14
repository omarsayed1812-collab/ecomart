import mongoose from "mongoose"
import { toJSONPlugin } from "../utils/toJSON.js"

const orderItemSchema = new mongoose.Schema(
  {
    product_id: String,
    title: String,
    price: Number,
    quantity: Number,
    image_url: String,
    company_id: String,
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    customer_email: { type: String, required: true },
    customer_name: { type: String, default: "" },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shipping_address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    carbon_saved_total: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
)

toJSONPlugin(orderSchema)

export default mongoose.model("Order", orderSchema)
