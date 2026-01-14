/**
 * Type Guard Examples for Optional Value Handling
 * This file demonstrates various patterns for safely handling .find() operations
 */

import {
    isDefined,
    isNullish,
    exists,
    findById,
    findByIdOrThrow,
    findByIdOrDefault,
    hasItemWithId,
    assertDefined,
    isStoreItemDefined,
    type StoreItem,
    type CartItem
} from "./typeGuards.ts";

// ============================================
// Example 1: Basic isDefined Type Guard
// ============================================

export function example1_BasicIsDefined(items: StoreItem[], id: number) {
    const item = items.find(i => i.id === id);

    // WITHOUT type guard - TypeScript knows item might be undefined
    // item.name; // ❌ Error: Object is possibly 'undefined'

    // WITH type guard - TypeScript knows item is defined inside the if block
    if (isDefined(item)) {
        console.log(item.name); // ✅ Safe access
        console.log(item.price);
        return item;
    }

    console.warn(`Item ${id} not found`);
    return null;
}

// ============================================
// Example 2: Using exists() - Semantic Alias
// ============================================

export function example2_UsingExists(items: StoreItem[], id: number) {
    const item = items.find(i => i.id === id);

    // exists() is an alias for isDefined() with better semantics
    if (exists(item)) {
        return { found: true, item }; // ✅ item is StoreItem, not StoreItem | undefined
    }

    return { found: false, item: null };
}

// ============================================
// Example 3: Using isNullish for Negative Check
// ============================================

export function example3_UsingIsNullish(items: StoreItem[], id: number) {
    const item = items.find(i => i.id === id);

    // Early return pattern with isNullish
    if (isNullish(item)) {
        throw new Error(`Item ${id} is required but not found`);
    }

    // TypeScript knows item is defined here
    return item.price * 1.1; // ✅ Safe access
}

// ============================================
// Example 4: Using findById Utility
// ============================================

export function example4_UsingFindById(items: StoreItem[], id: number) {
    // findById is a typed helper that wraps .find()
    const item = findById(items, id);

    if (isDefined(item)) {
        return `Found: ${item.name} - $${item.price}`;
    }

    return "Item not found";
}

// ============================================
// Example 5: Using findByIdOrThrow
// ============================================

export function example5_UsingFindByIdOrThrow(items: StoreItem[], id: number) {
    // When you EXPECT the item to always exist
    // Throws an error if not found
    const item = findByIdOrThrow(items, id, "StoreItem");

    // No need to check for undefined - TypeScript knows item is StoreItem
    return item.price * 2; // ✅ Safe access, no checks needed
}

// ============================================
// Example 6: Using findByIdOrDefault
// ============================================

export function example6_UsingFindByIdOrDefault(
    items: StoreItem[],
    id: number,
    fallbackItem: StoreItem
) {
    // Always returns a valid item (never undefined)
    const item = findByIdOrDefault(items, id, fallbackItem);

    // No need to check for undefined
    return item.price; // ✅ Always safe
}

// ============================================
// Example 7: Using hasItemWithId
// ============================================

export function example7_UsingHasItemWithId(
    cartItems: CartItem[],
    id: number
) {
    // Clean boolean check for existence
    if (hasItemWithId(cartItems, id)) {
        return "Item already in cart";
    } else {
        return "Item not in cart yet";
    }
}

// ============================================
// Example 8: Using assertDefined
// ============================================

export function example8_UsingAssertDefined(items: StoreItem[], id: number) {
    const item = items.find(i => i.id === id);

    // Assertion function - throws if item is undefined
    assertDefined(item, `Expected item ${id} to exist`);

    // TypeScript knows item is defined after the assertion
    return item.name.toUpperCase(); // ✅ Safe access
}

// ============================================
// Example 9: Using isStoreItemDefined
// ============================================

export function example9_UsingIsStoreItemDefined(items: StoreItem[], id: number) {
    const maybeItem = items.find(i => i.id === id);

    // Combines existence check with type validation
    if (isStoreItemDefined(maybeItem)) {
        return {
            id: maybeItem.id,
            name: maybeItem.name,
            price: maybeItem.price,
            imgUrl: maybeItem.imgUrl
        };
    }

    return null;
}

// ============================================
// Example 10: React Component Pattern
// ============================================

export function example10_ReactComponentPattern(
    storeItems: StoreItem[],
    cartItemId: number
) {
    const item = findById(storeItems, cartItemId);

    // Early return pattern common in React components
    if (!isDefined(item)) {
        console.warn(`Item ${cartItemId} not found`);
        return null; // Return null to render nothing
    }

    // Render logic with safe item access
    return {
        jsx: `<div>${item.name} - $${item.price}</div>`,
        item
    };
}

// ============================================
// Example 11: Array Reduce Pattern
// ============================================

export function example11_ReducePattern(
    storeItems: StoreItem[],
    cartItems: CartItem[]
) {
    return cartItems.reduce((total, cartItem) => {
        const storeItem = findById(storeItems, cartItem.id);

        // Type guard in reduce - skip if not found
        if (!isDefined(storeItem)) {
            console.warn(`Store item ${cartItem.id} not found`);
            return total; // Skip this item
        }

        return total + storeItem.price * cartItem.quantity;
    }, 0);
}

// ============================================
// Example 12: Chaining Multiple Checks
// ============================================

export function example12_ChainingChecks(
    items: StoreItem[],
    id: number
) {
    const item = findById(items, id);

    // Multiple conditions with type guard
    if (isDefined(item) && item.price > 100 && item.name.includes("Premium")) {
        return `Premium item: ${item.name}`;
    }

    return "Not a premium item";
}

// ============================================
// Example 13: Filter Pattern with Type Guards
// ============================================

export function example13_FilterPattern(
    storeItems: StoreItem[],
    cartItems: CartItem[]
) {
    // Get all store items that are in the cart
    const itemsInCart = cartItems
        .map(cartItem => findById(storeItems, cartItem.id))
        .filter(isDefined); // ✅ Type guard removes undefined values

    // itemsInCart is now StoreItem[], not (StoreItem | undefined)[]
    return itemsInCart.map(item => item.name);
}

// ============================================
// Example 14: Type Narrowing in Callbacks
// ============================================

export function example14_CallbackPattern(
    items: StoreItem[],
    ids: number[]
) {
    return ids
        .map(id => findById(items, id))
        .filter(exists) // Using exists alias for readability
        .map(item => item.price) // ✅ TypeScript knows item is StoreItem
        .reduce((sum, price) => sum + price, 0);
}

// ============================================
// Example 15: Optional Chaining vs Type Guards
// ============================================

export function example15_OptionalChainingComparison(
    items: StoreItem[],
    id: number
) {
    // BEFORE: Using optional chaining with fallback
    const priceOld = items.find(i => i.id === id)?.price || 0;

    // AFTER: Using type guard (more explicit and safer)
    const item = findById(items, id);
    const priceNew = isDefined(item) ? item.price : 0;

    // Type guard version:
    // - More explicit about null handling
    // - Better type narrowing
    // - Easier to add logging/error handling
    // - Clear intent in code

    return { priceOld, priceNew };
}
