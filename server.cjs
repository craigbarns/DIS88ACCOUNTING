const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");

// Serve static assets with caching
app.use(express.static(distPath, { maxAge: "1d" }));

// SPA fallback for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DISTRICT 88 LTD Accounting App running on port ${PORT}`);
});
