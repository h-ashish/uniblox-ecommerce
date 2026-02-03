/**
 * Cart Service
 * Handles shopping cart operations
 */

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
