const express = require("express");
const cors = require("cors");
const dataStore = require("./dataStore");
const cartService = require("./cartService");
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

// ============ Cart Routes ============

/**
 * POST /api/cart/add
 * Add item to cart
 * Body: { userId, productId, quantity }
 */
app.post("api/cart/add", (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId) {
      return res
        .status(400)
        .json({ success: false, message: "userId and productId are required" });
    }
    const cart = cartService.addToCart(userId, productId, quantity);
    res.json({ success: true, message: "Item added successfully", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
/**
 * GET /api/cart/:userId
 * Get user's cart
 */
app.get('/api/cart/:userId', (req, res) => {
  try {
    const cart = cartService.getCart(req.params.userId);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
