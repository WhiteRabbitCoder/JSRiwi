/**
 * Calculates the subtotal of order items
 * @param {Array} items - Array of items [{bookId, quantity, price}, ...]
 * @returns {number} Subtotal without discounts
 */
export function calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
}

/**
 * Applies a percentage discount to the total
 * @param {number} subtotal - Subtotal before discount
 * @param {number} discountPercent - Discount percentage (0-100)
 * @returns {number} Discount in absolute value
 */
export function calculateDiscount(subtotal, discountPercent) {
    if (discountPercent < 0 || discountPercent > 100) {
        throw new Error("Discount percentage must be between 0 and 100");
    }
    return subtotal * (discountPercent / 100);
}

/**
 * Calculates the final total of an order
 * @param {number} subtotal - Subtotal without discounts
 * @param {number} discountPercent - Discount percentage (optional, default 0)
 * @param {number} tax - Tax percentage (optional, default 0)
 * @returns {number} Final total rounded to 2 decimals
 */
export function calculateTotal(subtotal, discountPercent = 0, tax = 0) {
    const discount = calculateDiscount(subtotal, discountPercent);
    const afterDiscount = subtotal - discount;
    const totalTax = afterDiscount * (tax / 100);
    return Math.round((afterDiscount + totalTax) * 100) / 100;
}

/**
 * Validates that all items have positive quantity and available stock
 * @param {Array} items - Array of items with {bookId, quantity, price, stock}
 * @returns {boolean} True if all items are valid
 * @throws {Error} If items have invalid quantity or insufficient stock
 */
export function validateItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Items must be a non-empty array");
    }

    items.forEach(item => {
        if (!item.bookId || item.quantity === undefined || !item.price || item.stock === undefined) {
            throw new Error("Each item must have bookId, quantity, price, and stock");
        }
        if (item.quantity <= 0) {
            throw new Error("Item quantity must be greater than 0");
        }
        if (item.price < 0) {
            throw new Error("Item price cannot be negative");
        }
        if (item.quantity > item.stock) {
            throw new Error(`Insufficient stock for book ${item.bookId}. Available: ${item.stock}, Requested: ${item.quantity}`);
        }
    });

    return true;
}

/**
 * Calculates the profit of an order (price - cost)
 * @param {Array} items - Array of items with {quantity, price, cost}
 * @returns {number} Total profit
 */
export function calculateProfit(items) {
    return items.reduce((sum, item) => sum + (item.quantity * (item.price - item.cost)), 0);
}

/**
 * Generates a complete order summary
 * @param {object} order - Order data {userId, items, discountPercent, tax}
 * @returns {object} Summary with subtotal, discount, taxes and total
 */
export function generateOrderSummary(order) {
    validateItems(order.items);

    const subtotal = calculateSubtotal(order.items);
    const discount = calculateDiscount(subtotal, order.discountPercent || 0);
    const tax = (subtotal - discount) * ((order.tax || 0) / 100);
    const total = subtotal - discount + tax;
    const profit = calculateProfit(order.items);

    return {
        itemCount: order.items.length,
        subtotal: Math.round(subtotal * 100) / 100,
        discountPercent: order.discountPercent || 0,
        discountAmount: Math.round(discount * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        profit: Math.round(profit * 100) / 100
    };
}
