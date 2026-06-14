import mongoose from "mongoose"

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecomart"
  mongoose.set("strictQuery", true)
  const conn = await mongoose.connect(uri)
  console.log(`\u{1F343} MongoDB connected: ${conn.connection.host}/${conn.connection.name}`)
  return conn
}

export default connectDB
