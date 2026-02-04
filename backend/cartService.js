/**
 * Cart Service
 * Handles shopping cart operations
 */

const { use } = require("react");
const dataStore = require("./dataStore");
class CartService {
  /**
   * Adds an item to the user's cart
   * @param {string} userId - User identifier
   * @param {string} productId - Product identifier
   * @param {number} quantity - Quantity to add
   * @returns {object} - Updated cart or error
   */

  addToCart(userId, productId, quantity) {
    //Validate Inputs
    if (!userId || !productId) {
      throw new Error("UserId and ProductId are required");
    }

    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    //Check if product exists
    const product = dataStore.getProduct(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    //Check if stock is sufficient
    if (product.stock < quantity) {
      throw new Error(
        "Insufficient stock. Only " + product.stock + " items left in stock.",
      );
    }

    ///Get user's cart
    const cart = dataStore.getCart(userId);

    //Check if item is already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (existingItemIndex >= 0) {
      //Update quantity of existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      //Check total quantity against stock
      if (product.stock < newQuantity) {
        throw new Error(
          "Insufficient stock. Only " + product.stock + " items left in stock.",
        );
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      //Add new item to cart
      cart.items.push({
        productId,
        quantity,
        name: product.name,
        price: product.price,
      });
    }

    //update cart in data store
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
  updateCart(userId, productId, quantity) {
    if (!userId || !productId) {
      throw new Error("UserId and ProductId are required");
    }
    if (quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }
    const cart = dataStore.getCart(userId);
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex < 0) {
      throw new Error("Product not found in cart");
    }

    if (quantity === 0) {
      //Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock availability
      const product = dataStore.getProduct(productId);
      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock. Only ${product.stock} items left in stock.`,
        );
      }
      //Update quantity
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
    return this.updateCart(userId, productId, 0);
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
}

module.exports = new CartService();
