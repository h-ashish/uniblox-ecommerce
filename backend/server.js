const express = require("express");
const cors = require("cors");
const dataStore = require("./dataStore");
const app = express();
const port = 3000;

//Middleware
app.use(cors());
app.use(express.json());

//Request Logger Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

// ============ Product Routes ============

/**
 * GET /api/products
 * Get all products
 */
app.get("/api/products", (req, res) => {
  try {
    const products = dataStore.getAllProducts();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/products/:id
 * Get a specific product
 */
app.get("/api/products/:id", (req, res) => {
  try {
    const product = dataStore.getProduct(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
