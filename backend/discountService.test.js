/**
 * Unit tests for Discount Service
 */

const discountService = require('./discountService');
const dataStore = require('./dataStore');

describe('DiscountService', () => {
  beforeEach(() => {
    // Clear discount codes before each test
    dataStore.discountCodes.clear();
    dataStore.orderCounter = 0;
  });

  describe('generateDiscountCode', () => {
    test('should generate discount code for nth order', () => {
      const nthOrder = dataStore.config.nthOrder;
      const result = discountService.generateDiscountCode(nthOrder);

      expect(result).not.toBeNull();
      expect(result.code).toMatch(/^DISC-/);
      expect(result.discountPercentage).toBe(dataStore.config.discountPercentage);
      expect(result.used).toBe(false);
    });

    test('should not generate discount code for non-nth order', () => {
      const result = discountService.generateDiscountCode(1);
      expect(result).toBeNull();
    });

    test('should generate discount code for multiples of nth order', () => {
      const nthOrder = dataStore.config.nthOrder;
      
      const result1 = discountService.generateDiscountCode(nthOrder);
      expect(result1).not.toBeNull();

      const result2 = discountService.generateDiscountCode(nthOrder * 2);
      expect(result2).not.toBeNull();

      expect(result1.code).not.toBe(result2.code);
    });

    test('should store generated discount code', () => {
      const nthOrder = dataStore.config.nthOrder;
      const result = discountService.generateDiscountCode(nthOrder);

      const stored = dataStore.getDiscountCode(result.code);
      expect(stored).toEqual(result);
    });
  });

  describe('validateDiscountCode', () => {
    test('should return invalid for empty code', () => {
      const result = discountService.validateDiscountCode('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Discount code is required');
    });

    test('should return invalid for non-existent code', () => {
      const result = discountService.validateDiscountCode('INVALID-CODE');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid discount code');
    });

    test('should return valid for unused discount code', () => {
      const discount = discountService.generateDiscountCode(dataStore.config.nthOrder);
      const result = discountService.validateDiscountCode(discount.code);

      expect(result.isValid).toBe(true);
      expect(result.discountPercentage).toBe(dataStore.config.discountPercentage);
    });

    test('should return invalid for used discount code', () => {
      const discount = discountService.generateDiscountCode(dataStore.config.nthOrder);
      discountService.markAsUsed(discount.code);

      const result = discountService.validateDiscountCode(discount.code);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('already been used');
    });
  });

  describe('applyDiscount', () => {
    test('should correctly calculate discount', () => {
      const amount = 100;
      const percentage = 10;
      const result = discountService.applyDiscount(amount, percentage);

      expect(result.originalAmount).toBe(100);
      expect(result.discount).toBe(10);
      expect(result.finalAmount).toBe(90);
      expect(result.discountPercentage).toBe(10);
    });

    test('should handle decimal amounts correctly', () => {
      const amount = 99.99;
      const percentage = 15;
      const result = discountService.applyDiscount(amount, percentage);

      expect(result.originalAmount).toBe(99.99);
      expect(result.discount).toBe(15.00); // 15% of 99.99
      expect(result.finalAmount).toBe(84.99);
    });

    test('should handle 100% discount', () => {
      const amount = 100;
      const percentage = 100;
      const result = discountService.applyDiscount(amount, percentage);

      expect(result.discount).toBe(100);
      expect(result.finalAmount).toBe(0);
    });
  });

  describe('markAsUsed', () => {
    test('should mark discount code as used', () => {
      const discount = discountService.generateDiscountCode(dataStore.config.nthOrder);
      discountService.markAsUsed(discount.code);

      const stored = dataStore.getDiscountCode(discount.code);
      expect(stored.used).toBe(true);
      expect(stored.usedAt).toBeTruthy();
    });
  });
});
