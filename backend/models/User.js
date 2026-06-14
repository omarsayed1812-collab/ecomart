import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { toJSONPlugin } from "../utils/toJSON.js"

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // Platform role: 'admin' or 'user' (protected, only admins/seed set 'admin')
    role: { type: String, enum: ["admin", "user", "company"], default: "user" },
    // Custom field: null | 'customer' | 'pending_company' | 'company'
    account_type: { type: String, enum: ["customer", "pending_company", "company", null], default: null },
  },
  { timestamps: { createdAt: "created_date", updatedAt: "updated_date" } }
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password)
}

toJSONPlugin(userSchema)

export default mongoose.model("User", userSchema)
