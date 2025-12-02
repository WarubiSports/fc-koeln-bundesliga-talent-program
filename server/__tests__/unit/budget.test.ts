import { describe, it, expect } from 'vitest';

const WEEKLY_BUDGET = 30;

interface GroceryItem {
  id: number;
  price: number;
}

interface OrderItem {
  itemId: number;
  quantity: number;
}

function calculateOrderTotal(items: OrderItem[], priceMap: Map<number, number>): number {
  let total = 0;
  for (const item of items) {
    const price = priceMap.get(item.itemId);
    if (price !== undefined) {
      total += price * item.quantity;
    }
  }
  return total;
}

function validateBudget(total: number, budget: number = WEEKLY_BUDGET): { valid: boolean; message?: string } {
  if (total <= 0) {
    return { valid: false, message: 'Order total must be greater than zero' };
  }
  if (total > budget) {
    return { 
      valid: false, 
      message: `Order total (€${total.toFixed(2)}) exceeds weekly budget (€${budget})` 
    };
  }
  return { valid: true };
}

describe('Grocery Budget Logic', () => {
  describe('Order Total Calculation', () => {
    it('should calculate total for single item', () => {
      const priceMap = new Map([[1, 5.00]]);
      const items: OrderItem[] = [{ itemId: 1, quantity: 2 }];
      
      const total = calculateOrderTotal(items, priceMap);
      expect(total).toBe(10.00);
    });

    it('should calculate total for multiple items', () => {
      const priceMap = new Map([
        [1, 2.50],
        [2, 3.00],
        [3, 4.50]
      ]);
      const items: OrderItem[] = [
        { itemId: 1, quantity: 2 },
        { itemId: 2, quantity: 1 },
        { itemId: 3, quantity: 3 }
      ];
      
      const total = calculateOrderTotal(items, priceMap);
      expect(total).toBe(2.50 * 2 + 3.00 * 1 + 4.50 * 3);
      expect(total).toBe(21.50);
    });

    it('should handle zero quantity', () => {
      const priceMap = new Map([[1, 5.00]]);
      const items: OrderItem[] = [{ itemId: 1, quantity: 0 }];
      
      const total = calculateOrderTotal(items, priceMap);
      expect(total).toBe(0);
    });

    it('should handle empty order', () => {
      const priceMap = new Map([[1, 5.00]]);
      const items: OrderItem[] = [];
      
      const total = calculateOrderTotal(items, priceMap);
      expect(total).toBe(0);
    });

    it('should ignore items not in price map', () => {
      const priceMap = new Map([[1, 5.00]]);
      const items: OrderItem[] = [
        { itemId: 1, quantity: 2 },
        { itemId: 999, quantity: 5 }
      ];
      
      const total = calculateOrderTotal(items, priceMap);
      expect(total).toBe(10.00);
    });

    it('should handle decimal prices correctly', () => {
      const priceMap = new Map([[1, 2.99]]);
      const items: OrderItem[] = [{ itemId: 1, quantity: 3 }];
      
      const total = calculateOrderTotal(items, priceMap);
      expect(total).toBeCloseTo(8.97, 2);
    });
  });

  describe('Budget Validation', () => {
    it('should allow order under budget', () => {
      const result = validateBudget(25.00);
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should allow order exactly at budget', () => {
      const result = validateBudget(30.00);
      expect(result.valid).toBe(true);
    });

    it('should reject order over budget', () => {
      const result = validateBudget(35.00);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('exceeds weekly budget');
      expect(result.message).toContain('€35.00');
      expect(result.message).toContain('€30');
    });

    it('should reject zero total', () => {
      const result = validateBudget(0);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('greater than zero');
    });

    it('should reject negative total', () => {
      const result = validateBudget(-5.00);
      expect(result.valid).toBe(false);
    });

    it('should support custom budget limits', () => {
      const customBudget = 50;
      const result = validateBudget(45.00, customBudget);
      expect(result.valid).toBe(true);
    });

    it('should reject when exceeding custom budget', () => {
      const customBudget = 20;
      const result = validateBudget(25.00, customBudget);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('€20');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const result = validateBudget(0.01);
      expect(result.valid).toBe(true);
    });

    it('should handle amounts just over budget', () => {
      const result = validateBudget(30.01);
      expect(result.valid).toBe(false);
    });

    it('should handle large quantities', () => {
      const priceMap = new Map([[1, 0.50]]);
      const items: OrderItem[] = [{ itemId: 1, quantity: 100 }];
      
      const total = calculateOrderTotal(items, priceMap);
      expect(total).toBe(50.00);
      
      const result = validateBudget(total);
      expect(result.valid).toBe(false);
    });
  });
});
