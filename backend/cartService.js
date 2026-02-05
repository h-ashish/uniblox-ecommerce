/**
 * Cart Service
 * Handles shopping cart operations
 */

const dataStore = require("./dataStore");

class CartService {
  th;
  addToCart(userId, productId, quantity = 1) {
    // Validate inputs
    if (!userId || !productId) {
      throw new Error("User ID and Product ID are required");
    }

    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Check if product exists
    const product = dataStore.getProduct(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check stock availability
    if (product.stock < quantity) {
      throw new Error(
        `Insufficient stock. Only ${product.stock} items available`,
      );
    }

    // Get or create cart
    const cart = dataStore.getCart(userId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check total quantity against stock
      if (product.stock < newQuantity) {
        throw new Error(
          `Insufficient stock. Only ${product.stock} items available`,
        );
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    // Update cart in store
    dataStore.updateCart(userId, cart);

    return this.getCart(userId);
  }

  /**
   * Updates item quantity in cart
   * @param {string} userId - User identifier
   * @param {string} productId - Product identifier
   * @param {number} quantity - New quantity (0 to remove)
   * @returns {object} - Updated cart
   */
  updateCartItem(userId, productId, quantity) {
    if (!userId || !productId) {
      throw new Error("User ID and Product ID are required");
    }

    if (quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    const cart = dataStore.getCart(userId);
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex < 0) {
      throw new Error("Item not found in cart");
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock availability
      const product = dataStore.getProduct(productId);
      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock. Only ${product.stock} items available`,
        );
      }

      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    dataStore.updateCart(userId, cart);
    return this.getCart(userId);
  }

  /**
   * Removes an item from cart
   * @param {string} userId - User identifier
   * @param {string} productId - Product identifier
   * @returns {object} - Updated cart
   */
  removeFromCart(userId, productId) {
    return this.updateCartItem(userId, productId, 0);
  }

  /**
   * Gets the user's cart with calculated totals
   * @param {string} userId - User identifier
   * @returns {object} - Cart with totals
   */
  getCart(userId) {
    const cart = dataStore.getCart(userId);

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      userId: cart.userId,
      items: cart.items,
      totalItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
    };
  }

  /**
   * Clears all items from cart
   * @param {string} userId - User identifier
   */
  clearCart(userId) {
    dataStore.clearCart(userId);
  }

  /**
   * Validates cart before checkout
   * @param {string} userId - User identifier
   * @returns {object} - Validation result
   */
  validateCart(userId) {
    const cart = this.getCart(userId);

    if (cart.items.length === 0) {
      return { isValid: false, message: "Cart is empty" };
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = dataStore.getProduct(item.productId);
      if (!product) {
        return { isValid: false, message: `Product ${item.name} not found` };
      }
      if (product.stock < item.quantity) {
        return {
          isValid: false,
          message: `Insufficient stock for ${item.name}. Only ${product.stock} available`,
        };
      }
    }

    return { isValid: true, cart };
  }
}

module.exports = new CartService();
