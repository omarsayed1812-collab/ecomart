export const notFound = (req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` })
}

export const errorHandler = (err, req, res, next) => {
  console.error(err)
  const status = err.statusCode || 500
  res.status(status).json({
    error: err.message || "Server error",
  })
}

// Wrap async route handlers so thrown errors reach the error middleware
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
