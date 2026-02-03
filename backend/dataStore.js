/**
 * In-Memory Data Store
 * Simulates database storage for the e-commerce application
 */

class DataStore {
  constructor() {
    // Store for products
    this.products = new Map([
      ["1", { id: "1", name: "Laptop", price: 1000, stock: 10 }],
      ["2", { id: "2", name: "Mouse", price: 25, stock: 50 }],
      ["3", { id: "3", name: "Keyboard", price: 75, stock: 30 }],
      ["4", { id: "4", name: "Monitor", price: 300, stock: 15 }],
      ["5", { id: "5", name: "Headphones", price: 150, stock: 25 }],
    ]);

    // Store for shopping carts (userId -> cart)
    this.carts = new Map();

    // Store for orders (orderId -> order)
    this.orders = new Map();

    // Store for discount codes (code -> discount info)
    this.discountCodes = new Map();

    // Counter for orders to track nth order
    this.orderCounter = 0;

    // Configuration for discount system
    this.config = {
      nthOrder: 3, // Every 3rd order gets a discount code
      discountPercentage: 10, // 10% discount
    };
  }

  // Product methods
  getProduct(productId) {
    return this.products.get(productId);
  }

  getAllProducts() {
    return Array.from(this.products.values());
  }

  // Cart methods
  getCart(userId) {
    if (!this.carts.has(userId)) {
      this.carts.set(userId, { userId, items: [] });
    }
    return this.carts.get(userId);
  }

  updateCart(userId, cart) {
    this.carts.set(userId, cart);
  }

  clearCart(userId) {
    this.carts.set(userId, { userId, items: [] });
  }
}

module.exports = new DataStore();
