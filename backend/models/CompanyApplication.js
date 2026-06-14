import mongoose from "mongoose"
import { toJSONPlugin } from "../utils/toJSON.js"

const companyApplicationSchema = new mongoose.Schema(
  {
    user_email: { type: String, required: true },
    user_name: { type: String, default: "" },
    company_name: { type: String, required: true },
    company_description: { type: String, default: "" },
    website: { type: String, default: "" },
    certificate_url: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    admin_note: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
)

toJSONPlugin(companyApplicationSchema)

export default mongoose.model("CompanyApplication", companyApplicationSchema)
