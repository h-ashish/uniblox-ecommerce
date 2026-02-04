const express = require("express");
const cors = require("cors");
const dataStore = require("./dataStore");
const cartService = require("./cartService");
const orderService = require("./orderService");
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
app.get("/api/cart/:userId", (req, res) => {
  try {
    const cart = cartService.getCart(req.params.userId);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
/**
 * PUT /api/cart/update
 * Update cart item quantity
 * Body: { userId, productId, quantity }
 */
app.put("api/cart/update", (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || quantity === undefined) {
      return res.json({
        success: false,
        message: "userId, productId and quantity are required",
      });
    }
    const cart = cartService.updateCartItem(userId, productId, quantity);
    res.json({ success: true, message: "Cart Updated successfully", cart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
/**
 * DELETE /api/cart/remove
 * Remove item from cart
 * Body: { userId, productId }
 */
app.delete("api/cart/delete", (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.json({
        success: false,
        message: "userId and productId are required",
      });
    }
    const cart = cartService.removeFromCart(userId, productId);
    res.json({ success: true, message: "Item removed successfully", cart });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// ============ Checkout Route ============

/**
 * POST /api/checkout
 * Process checkout
 * Body: { userId, discountCode? }
 */
app.post("api/checkout", (req, res) => {
  try {
    const { userId, discountCode } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "userId is required" });
    }
    const result = orderService.checkout(userId, discountCode);
    res.json({ success: true, message: "Checkout successful", ...result });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// ============ Order Routes ============

/**
 * GET /api/orders/:orderId
 * Get order by ID
 */
app.get("/api/orders/:orderId", (req, res) => {
  try {
    const order = orderService.getOrder(req.params.orderId);
    res.json({ success: true, order });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
/**
 * GET /api/orders/user/:userId
 * Get all orders for a user
 */
app.get("/api/orders/user/:userId", (req, res) => {
  try {
    const orders = orderService.getUserOrders(req.params.userId);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = app;
