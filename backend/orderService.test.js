/**
 * Unit tests for Order Service
 */

const orderService = require('./orderService');
const cartService = require('./cartService');
const discountService = require('./discountService');
const dataStore = require('./dataStore');

describe('OrderService', () => {
  const testUserId = 'test-user-1';

  beforeEach(() => {
    // Clear all data before each test
    dataStore.carts.clear();
    dataStore.orders.clear();
    dataStore.discountCodes.clear();
    dataStore.orderCounter = 0;
    
    // Reset product stock
    dataStore.products.forEach(product => {
      if (product.id === '1') product.stock = 10;
      if (product.id === '2') product.stock = 50;
    });
  });

  describe('checkout', () => {
    test('should successfully checkout with items in cart', () => {
      // Add items to cart
      cartService.addToCart(testUserId, '1', 2); // Laptop @ 1000
      
      const result = orderService.checkout(testUserId);

      expect(result.order).toBeTruthy();
      expect(result.order.userId).toBe(testUserId);
      expect(result.order.items).toHaveLength(1);
      expect(result.order.subtotal).toBe(2000);
      expect(result.order.finalAmount).toBe(2000);
      expect(result.message).toBe('Order placed successfully');
    });

    test('should throw error for empty cart', () => {
      expect(() => {
        orderService.checkout(testUserId);
      }).toThrow('Cart is empty');
    });

    test('should apply valid discount code', () => {
      // Generate a discount code
      const discount = discountService.generateDiscountCode(dataStore.config.nthOrder);
      
      // Add items to cart
      cartService.addToCart(testUserId, '1', 1); // Laptop @ 1000
      
      const result = orderService.checkout(testUserId, discount.code);

      expect(result.order.discountCode).toBe(discount.code);
      expect(result.order.discount).toBe(100); // 10% of 1000
      expect(result.order.finalAmount).toBe(900);
    });

    test('should reject invalid discount code', () => {
      cartService.addToCart(testUserId, '1', 1);

      expect(() => {
        orderService.checkout(testUserId, 'INVALID-CODE');
      }).toThrow('Invalid discount code');
    });

    test('should reject used discount code', () => {
      const discount = discountService.generateDiscountCode(dataStore.config.nthOrder);
      discountService.markAsUsed(discount.code);
      
      cartService.addToCart(testUserId, '1', 1);

      expect(() => {
        orderService.checkout(testUserId, discount.code);
      }).toThrow('already been used');
    });

    test('should update product stock after checkout', () => {
      const productId = '1';
      const initialStock = dataStore.getProduct(productId).stock;
      
      cartService.addToCart(testUserId, productId, 3);
      orderService.checkout(testUserId);

      const updatedStock = dataStore.getProduct(productId).stock;
      expect(updatedStock).toBe(initialStock - 3);
    });

    test('should clear cart after successful checkout', () => {
      cartService.addToCart(testUserId, '1', 2);
      orderService.checkout(testUserId);

      const cart = cartService.getCart(testUserId);
      expect(cart.items).toHaveLength(0);
    });

    test('should generate new discount code for nth order', () => {
      const nthOrder = dataStore.config.nthOrder;
      
      // Place orders until we reach nth order
      for (let i = 0; i < nthOrder; i++) {
        const userId = `user-${i}`;
        cartService.addToCart(userId, '2', 1); // Mouse @ 25
        const result = orderService.checkout(userId);

        if (i === nthOrder - 1) {
          // This is the nth order
          expect(result.newDiscountCode).toBeTruthy();
          expect(result.newDiscountCode.code).toMatch(/^DISC-/);
        } else {
          expect(result.newDiscountCode).toBeNull();
        }
      }
    });

    test('should mark discount code as used after checkout', () => {
      const discount = discountService.generateDiscountCode(dataStore.config.nthOrder);
      
      cartService.addToCart(testUserId, '1', 1);
      orderService.checkout(testUserId, discount.code);

      const storedDiscount = dataStore.getDiscountCode(discount.code);
      expect(storedDiscount.used).toBe(true);
    });
  });

  describe('getOrder', () => {
    test('should retrieve order by ID', () => {
      cartService.addToCart(testUserId, '1', 1);
      const checkoutResult = orderService.checkout(testUserId);
      
      const order = orderService.getOrder(checkoutResult.order.id);
      expect(order).toEqual(checkoutResult.order);
    });

    test('should throw error for non-existent order', () => {
      expect(() => {
        orderService.getOrder('invalid-id');
      }).toThrow('Order not found');
    });
  });

  describe('getUserOrders', () => {
    test('should return all orders for a user', () => {
      // Place two orders for the same user
      cartService.addToCart(testUserId, '1', 1);
      orderService.checkout(testUserId);

      cartService.addToCart(testUserId, '2', 2);
      orderService.checkout(testUserId);

      const orders = orderService.getUserOrders(testUserId);
      expect(orders).toHaveLength(2);
      expect(orders[0].userId).toBe(testUserId);
      expect(orders[1].userId).toBe(testUserId);
    });

    test('should return empty array for user with no orders', () => {
      const orders = orderService.getUserOrders('no-orders-user');
      expect(orders).toHaveLength(0);
    });
  });

  describe('getAllOrders', () => {
    test('should return all orders from all users', () => {
      // Place orders from different users
      cartService.addToCart('user-1', '1', 1);
      orderService.checkout('user-1');

      cartService.addToCart('user-2', '2', 2);
      orderService.checkout('user-2');

      const orders = orderService.getAllOrders();
      expect(orders).toHaveLength(2);
    });
  });
});
