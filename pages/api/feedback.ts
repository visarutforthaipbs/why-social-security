try {
  // your existing code
} catch (error) {
  console.error("MongoDB Error:", error);
  return res.status(500).json({ error: error.message });
}
