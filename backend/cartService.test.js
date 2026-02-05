/**
 * Unit tests for Cart Service
 */

const cartService = require('./cartService');
const dataStore = require('./dataStore');

describe('CartService', () => {
  const testUserId = 'test-user-1';
  const testProductId = '1'; // Laptop

  beforeEach(() => {
    // Clear carts before each test
    dataStore.carts.clear();
  });

  describe('addToCart', () => {
    test('should add item to empty cart', () => {
      const result = cartService.addToCart(testUserId, testProductId, 2);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe(testProductId);
      expect(result.items[0].quantity).toBe(2);
      expect(result.totalItems).toBe(2);
    });

    test('should increment quantity for existing item', () => {
      cartService.addToCart(testUserId, testProductId, 1);
      const result = cartService.addToCart(testUserId, testProductId, 2);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(3);
      expect(result.totalItems).toBe(3);
    });

    test('should add multiple different products', () => {
      cartService.addToCart(testUserId, '1', 1); // Laptop
      const result = cartService.addToCart(testUserId, '2', 2); // Mouse

      expect(result.items).toHaveLength(2);
      expect(result.totalItems).toBe(3);
    });

    test('should throw error for invalid product', () => {
      expect(() => {
        cartService.addToCart(testUserId, 'invalid-id', 1);
      }).toThrow('Product not found');
    });

    test('should throw error for insufficient stock', () => {
      expect(() => {
        cartService.addToCart(testUserId, testProductId, 1000);
      }).toThrow('Insufficient stock');
    });

    test('should throw error for negative quantity', () => {
      expect(() => {
        cartService.addToCart(testUserId, testProductId, -1);
      }).toThrow('Quantity must be greater than 0');
    });

    test('should calculate subtotal correctly', () => {
      cartService.addToCart(testUserId, '1', 2); // Laptop @ 1000
      const result = cartService.addToCart(testUserId, '2', 3); // Mouse @ 25

      expect(result.subtotal).toBe(2075); // 2000 + 75
    });
  });

  describe('updateCartItem', () => {
    test('should update item quantity', () => {
      cartService.addToCart(testUserId, testProductId, 2);
      const result = cartService.updateCartItem(testUserId, testProductId, 5);

      expect(result.items[0].quantity).toBe(5);
    });

    test('should remove item when quantity is 0', () => {
      cartService.addToCart(testUserId, testProductId, 2);
      const result = cartService.updateCartItem(testUserId, testProductId, 0);

      expect(result.items).toHaveLength(0);
    });

    test('should throw error for item not in cart', () => {
      expect(() => {
        cartService.updateCartItem(testUserId, testProductId, 5);
      }).toThrow('Item not found in cart');
    });

    test('should throw error for negative quantity', () => {
      cartService.addToCart(testUserId, testProductId, 2);
      expect(() => {
        cartService.updateCartItem(testUserId, testProductId, -1);
      }).toThrow('Quantity cannot be negative');
    });
  });

  describe('removeFromCart', () => {
    test('should remove item from cart', () => {
      cartService.addToCart(testUserId, testProductId, 2);
      const result = cartService.removeFromCart(testUserId, testProductId);

      expect(result.items).toHaveLength(0);
      expect(result.totalItems).toBe(0);
    });
  });

  describe('getCart', () => {
    test('should return empty cart for new user', () => {
      const result = cartService.getCart(testUserId);

      expect(result.userId).toBe(testUserId);
      expect(result.items).toHaveLength(0);
      expect(result.totalItems).toBe(0);
      expect(result.subtotal).toBe(0);
    });

    test('should return cart with items', () => {
      cartService.addToCart(testUserId, testProductId, 2);
      const result = cartService.getCart(testUserId);

      expect(result.items).toHaveLength(1);
      expect(result.totalItems).toBe(2);
    });
  });

  describe('validateCart', () => {
    test('should return invalid for empty cart', () => {
      const result = cartService.validateCart(testUserId);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Cart is empty');
    });

    test('should return valid for cart with items', () => {
      cartService.addToCart(testUserId, testProductId, 2);
      const result = cartService.validateCart(testUserId);

      expect(result.isValid).toBe(true);
      expect(result.cart).toBeTruthy();
    });

    test('should detect insufficient stock', () => {
      // Add item to cart
      cartService.addToCart(testUserId, testProductId, 2);
      
      // Manually reduce stock to simulate stock change
      const product = dataStore.getProduct(testProductId);
      const originalStock = product.stock;
      product.stock = 1;

      const result = cartService.validateCart(testUserId);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Insufficient stock');

      // Restore stock
      product.stock = originalStock;
    });
  });

  describe('clearCart', () => {
    test('should clear all items from cart', () => {
      cartService.addToCart(testUserId, testProductId, 2);
      cartService.clearCart(testUserId);
      
      const result = cartService.getCart(testUserId);
      expect(result.items).toHaveLength(0);
    });
  });
});
