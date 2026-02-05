/**
 * Order Service
 * Handles order creation and checkout process
 */

const { v4: uuidv4 } = require("uuid");
const dataStore = require("./dataStore");
const cartService = require("./cartService");
const discountService = require("./discountService");

class OrderService {
  /**
   * Processes checkout and creates an order
   * @param {string} userId - User identifier
   * @param {string} discountCode - Optional discount code
   * @returns {object} - Created order with discount info
   */
  checkout(userId, discountCode = null) {
    // Validate cart
    const cartValidation = cartService.validateCart(userId);
    if (!cartValidation.isValid) {
      throw new Error(cartValidation.message);
    }

    const cart = cartValidation.cart;
    let discountInfo = null;
    let appliedDiscount = null;

    // Validate and apply discount code if provided
    if (discountCode) {
      const validation = discountService.validateDiscountCode(discountCode);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      discountInfo = validation.discountInfo;
      appliedDiscount = discountService.applyDiscount(
        cart.subtotal,
        validation.discountPercentage,
      );
    }

    // Create order
    const order = {
      id: uuidv4(),
      userId,
      items: cart.items.map((item) => ({ ...item })), // Deep copy
      subtotal: cart.subtotal,
      discount: appliedDiscount ? appliedDiscount.discount : 0,
      finalAmount: appliedDiscount
        ? appliedDiscount.finalAmount
        : cart.subtotal,
      discountCode: discountCode || null,
      discountPercentage: appliedDiscount
        ? appliedDiscount.discountPercentage
        : 0,
      createdAt: new Date().toISOString(),
      status: "completed",
    };

    // Save order
    dataStore.createOrder(order);

    // Mark discount code as used if applied
    if (discountCode && discountInfo) {
      discountService.markAsUsed(discountCode);
    }

    // Update product stock
    this.updateProductStock(order.items);

    // Clear cart
    cartService.clearCart(userId);

    // Check if this order qualifies for a new discount code
    const currentOrderNumber = dataStore.getOrderCount();
    const newDiscountCode =
      discountService.generateDiscountCode(currentOrderNumber);

    return {
      order,
      message: "Order placed successfully",
      newDiscountCode: newDiscountCode
        ? {
            code: newDiscountCode.code,
            discountPercentage: newDiscountCode.discountPercentage,
            message: `Congratulations! You've earned a ${newDiscountCode.discountPercentage}% discount code for your next purchase!`,
          }
        : null,
    };
  }

  /**
   * Updates product stock after order placement
   * @param {array} items - Order items
   */
  updateProductStock(items) {
    items.forEach((item) => {
      const product = dataStore.getProduct(item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    });
  }

  /**
   * Gets order by ID
   * @param {string} orderId - Order identifier
   * @returns {object} - Order details
   */
  getOrder(orderId) {
    const order = dataStore.getOrder(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  /**
   * Gets all orders for a user
   * @param {string} userId - User identifier
   * @returns {array} - Array of orders
   */
  getUserOrders(userId) {
    const allOrders = dataStore.getAllOrders();
    return allOrders.filter((order) => order.userId === userId);
  }

  /**
   * Gets all orders (admin function)
   * @returns {array} - Array of all orders
   */
  getAllOrders() {
    return dataStore.getAllOrders();
  }
}

module.exports = new OrderService();
