import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  let token
  const header = req.headers.authorization
  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1]
  }
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret")
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ error: "User not found" })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}

export const companyOnly = (req, res, next) => {
  const isCompany = req.user && (req.user.role === "company" || req.user.account_type === "company")
  if (!isCompany) {
    return res.status(403).json({ error: "Company access required" })
  }
  next()
}
