import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

import connectDB from "./config/db.js"
import { errorHandler, notFound } from "./middleware/error.js"

import authRoutes from "./routes/auth.js"
import productRoutes from "./routes/products.js"
import companyApplicationRoutes from "./routes/companyApplications.js"
import productRequestRoutes from "./routes/productRequests.js"
import cartRoutes from "./routes/cart.js"
import wishlistRoutes from "./routes/wishlist.js"
import orderRoutes from "./routes/orders.js"
import userRoutes from "./routes/users.js"
import uploadRoutes from "./routes/upload.js"
import reviewRoutes from "./routes/reviews.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: "15mb" }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "ecomart-api" }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/company-applications", companyApplicationRoutes)
app.use("/api/product-requests", productRequestRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/reviews", reviewRoutes)

// Serve the built frontend (single-service / Docker deployment).
// The frontend's Vite build output is copied into ./public inside the image.
const clientDist = path.join(__dirname, "public")
const hasClient = fs.existsSync(path.join(clientDist, "index.html"))
if (hasClient) {
  app.use(express.static(clientDist))
}

// 404 (JSON) only for unknown API routes
app.use("/api", notFound)

// SPA fallback: serve index.html for any non-API route so client-side routing works
if (hasClient) {
  app.get("*", (req, res) => res.sendFile(path.join(clientDist, "index.html")))
} else {
  app.use(notFound)
}

app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`\u2705 EcoMart API running on port ${PORT}`))
  })
  .catch((err) => {
    console.error("\u274C Failed to start server:", err.message)
    process.exit(1)
  })
