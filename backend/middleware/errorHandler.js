module.exports = (err, req, res, _next) => {
  console.error("Unhandled error:", err?.stack || err);

  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== "production";

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(isDev ? { error: err.stack } : {}),
  });
};
