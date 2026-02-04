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

  // Order methods
  createOrder(order) {
    this.orderCounter++;
    this.orders.set(order.id, order);
    return order;
  }

  getOrder(orderId) {
    return this.orders.get(orderId);
  }

  getAllOrders() {
    return Array.from(this.orders.values());
  }

  getOrderCount() {
    return this.orderCounter;
  }

  // Discount code methods
  createDiscountCode(code, discountInfo) {
    this.discountCodes.set(code, discountInfo);
  }

  getDiscountCode(code) {
    return this.discountCodes.get(code);
  }

  isDiscountCodeValid(code) {
    const discount = this.discountCodes.get(code);
    return discount && !discount.used;
  }

  markDiscountAsUsed(code) {
    const discount = this.discountCodes.get(code);
    if (discount) {
      discount.used = true;
      discount.usedAt = new Date().toISOString();
    }
  }

  getAllDiscountCodes() {
    return Array.from(this.discountCodes.values());
  }

  // Analytics methods
  getStats() {
    const orders = this.getAllOrders();
    const discountCodes = this.getAllDiscountCodes();

    // Calculate total items purchased
    const totalItemsPurchased = orders.reduce((sum, order) => {
      return (
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
      );
    }, 0);

    // Calculate total revenue
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.finalAmount,
      0,
    );

    // Count discount codes
    const totalDiscountCodes = discountCodes.length;
    const usedDiscountCodes = discountCodes.filter((d) => d.used).length;

    // Calculate total discount given
    const totalDiscountGiven = orders.reduce((sum, order) => {
      return sum + (order.discount || 0);
    }, 0);

    return {
      totalItemsPurchased,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      discountCodes: {
        total: totalDiscountCodes,
        used: usedDiscountCodes,
        unused: totalDiscountCodes - usedDiscountCodes,
      },
      totalDiscountGiven: parseFloat(totalDiscountGiven.toFixed(2)),
      totalOrders: orders.length,
    };
  }
}

// Export singleton instance
module.exports = new DataStore();
