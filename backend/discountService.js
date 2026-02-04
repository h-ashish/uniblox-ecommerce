/**
 * Discount Service
 * Handles all discount-related business logic
 */

const { v4: uuidv4 } = require("uuid");
const dataStore = require("./dataStore");

class DiscountService {
  /**
   * Generates a discount code if the nth order condition is met
   * @param {number} orderNumber - The current order number
   * @returns {object|null} - Discount code object or null if condition not met
   */
  generateDiscountCode(orderNumber) {
    const { nthOrder, discountPercentage } = dataStore.config;

    // Check if this is an nth order
    if (orderNumber % nthOrder !== 0) {
      return null;
    }

    // Generate unique discount code
    const code = this.createUniqueCode();
    const discountInfo = {
      code,
      discountPercentage,
      generatedAt: new Date().toISOString(),
      used: false,
      usedAt: null,
      orderNumber,
    };

    // Store the discount code
    dataStore.createDiscountCode(code, discountInfo);

    return discountInfo;
  }

  /**
   * Creates a unique alphanumeric discount code
   * @returns {string} - Unique discount code
   */
  createUniqueCode() {
    const prefix = "DISC";
    const uniqueId = uuidv4().substring(0, 8).toUpperCase();
    return `${prefix}-${uniqueId}`;
  }

  /**
   * Validates a discount code
   * @param {string} code - Discount code to validate
   * @returns {object} - Validation result with isValid flag and discount info
   */
  validateDiscountCode(code) {
    if (!code) {
      return { isValid: false, message: "Discount code is required" };
    }

    const discountInfo = dataStore.getDiscountCode(code);

    if (!discountInfo) {
      return { isValid: false, message: "Invalid discount code" };
    }

    if (discountInfo.used) {
      return {
        isValid: false,
        message: "Discount code has already been used",
        usedAt: discountInfo.usedAt,
      };
    }

    return {
      isValid: true,
      discountPercentage: discountInfo.discountPercentage,
      discountInfo,
    };
  }

  /**
   * Applies discount to an amount
   * @param {number} amount - Original amount
   * @param {number} discountPercentage - Discount percentage to apply
   * @returns {object} - Object with original amount, discount, and final amount
   */
  applyDiscount(amount, discountPercentage) {
    const discount = (amount * discountPercentage) / 100;
    const finalAmount = amount - discount;

    return {
      originalAmount: parseFloat(amount.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
      discountPercentage,
    };
  }

  /**
   * Marks a discount code as used
   * @param {string} code - Discount code to mark as used
   */
  markAsUsed(code) {
    dataStore.markDiscountAsUsed(code);
  }

  /**
   * Gets all discount codes (admin function)
   * @returns {array} - Array of all discount codes
   */
  getAllDiscountCodes() {
    return dataStore.getAllDiscountCodes();
  }
}

module.exports = new DiscountService();
