/**
 * External Boundary Type Guard Examples
 * Demonstrates how type guards protect integration points and catch errors early
 */

import {
    isShoppingCartContext,
    assertShoppingCartContext,
    isValidStoreItemProps,
    validateStoreItemProps,
    isValidId,
    validateId,
    isValidQuantity,
    validateQuantity,
    isValidReactChildren,
    isValidProviderProps,
    type ShoppingCartContextType,
    type StoreItemProps
} from "./typeGuards";

// ============================================
// Example 1: Context Validation - Catching Provider Errors
// ============================================

/**
 * PROBLEM: Using context hook outside of provider
 * This is a common integration error
 */
export function example1_ContextWithoutProvider() {
    // Simulating useContext return when used outside provider
    const contextValue = undefined;

    // WITHOUT type guard - would crash at runtime
    // const cart = contextValue.cartItems; // ❌ Runtime error

    // WITH type guard - catches error early with clear message
    try {
        assertShoppingCartContext(contextValue);
        // This line never executes because assertion throws
        console.log("Context is valid");
    } catch (error) {
        console.error(error); // ✅ Clear error: "useShoppingCart must be used within ShoppingCartProvider"
        return null;
    }
}

/**
 * Example of proper context validation in a custom hook
 */
export function example2_SafeContextHook() {
    // This would be useContext(ShoppingCartContext) in real code
    const context: unknown = {}; // Simulating empty context

    // Type guard checks if context is properly initialized
    if (!isShoppingCartContext(context)) {
        throw new Error(
            'useShoppingCart must be used within ShoppingCartProvider'
        );
    }

    // TypeScript knows context is ShoppingCartContextType here
    const { cartItems, cartQuantity } = context;
    return { cartItems, cartQuantity };
}

// ============================================
// Example 3: Props Validation - Component Boundaries
// ============================================

/**
 * Validating component props from external data sources
 */
export function example3_PropsValidation() {
    // Simulating data from JSON or API (could be corrupted)
    const externalData: unknown = {
        id: "not-a-number", // ❌ Wrong type
        name: "",           // ❌ Empty string
        price: -10,         // ❌ Negative price
        imgUrl: ""          // ❌ Empty URL
    };

    // WITHOUT type guard - component crashes at runtime
    // const StoreItem = ({ id, name, price, imgUrl }) => {
    //   return <div>{name} - ${price}</div>; // ❌ Crashes
    // };

    // WITH type guard - catches invalid props early
    if (!isValidStoreItemProps(externalData)) {
        console.error('Invalid props detected, will not render component');
        return null; // ✅ Graceful handling
    }

    // TypeScript knows externalData is StoreItemProps here
    return externalData;
}

/**
 * Using validateStoreItemProps with throw
 */
export function example4_StrictPropsValidation(props: unknown) {
    // Throws immediately if props are invalid
    // Use this when you want to fail fast
    const validProps = validateStoreItemProps(props);

    // No need to check - validProps is guaranteed to be correct
    return `Item: ${validProps.name} - $${validProps.price}`;
}

// ============================================
// Example 5: ID Validation at API Boundaries
// ============================================

/**
 * Validating IDs from URL parameters or user input
 */
export function example5_IDValidation() {
    // Simulating ID from URL parameter (could be anything)
    const urlParamId: unknown = "abc"; // ❌ Not a number
    const urlParamId2: unknown = -5;   // ❌ Negative
    const urlParamId3: unknown = 3.14; // ❌ Not an integer
    const urlParamId4: unknown = 42;   // ✅ Valid

    // Type guard validation
    console.log(isValidId(urlParamId));  // false
    console.log(isValidId(urlParamId2)); // false
    console.log(isValidId(urlParamId3)); // false
    console.log(isValidId(urlParamId4)); // true

    // Safe usage
    if (isValidId(urlParamId4)) {
        // TypeScript knows urlParamId4 is number here
        return { id: urlParamId4 };
    }

    return null;
}

/**
 * Strict ID validation that throws
 */
export function example6_StrictIDValidation(id: unknown) {
    // Throws if ID is invalid
    const validId = validateId(id, "Product ID");

    // No need to check - validId is guaranteed to be valid
    return `Processing item ${validId}`;
}

// ============================================
// Example 7: Quantity Validation
// ============================================

/**
 * Validating quantity values from forms or APIs
 */
export function example7_QuantityValidation() {
    // Simulating quantity from form input
    const formInput1: unknown = 0;      // ❌ Zero
    const formInput2: unknown = -1;     // ❌ Negative
    const formInput3: unknown = 3.5;    // ❌ Not integer
    const formInput4: unknown = "5";    // ❌ String
    const formInput5: unknown = 5;      // ✅ Valid

    console.log(isValidQuantity(formInput1)); // false
    console.log(isValidQuantity(formInput2)); // false
    console.log(isValidQuantity(formInput3)); // false
    console.log(isValidQuantity(formInput4)); // false
    console.log(isValidQuantity(formInput5)); // true

    // Safe usage
    if (isValidQuantity(formInput5)) {
        return { quantity: formInput5 };
    }

    return null;
}

/**
 * Strict quantity validation that throws
 */
export function example7b_StrictQuantityValidation(quantity: unknown) {
    // Throws if quantity is invalid
    const validQuantity = validateQuantity(quantity);

    // No need to check - validQuantity is guaranteed to be valid
    return `Adding ${validQuantity} items to cart`;
}

// ============================================
// Example 8: React Children Validation
// ============================================

/**
 * Validating React children prop
 */
export function example8_ChildrenValidation() {
    const validChildren1 = null;           // ✅ Valid
    const validChildren2 = "Hello";        // ✅ Valid
    const validChildren3 = 42;             // ✅ Valid
    const validChildren4 = [1, 2, 3];      // ✅ Valid
    const validChildren5 = { type: 'div' }; // ✅ Valid (React element)

    console.log(isValidReactChildren(validChildren1)); // true
    console.log(isValidReactChildren(validChildren2)); // true
    console.log(isValidReactChildren(validChildren3)); // true
    console.log(isValidReactChildren(validChildren4)); // true
    console.log(isValidReactChildren(validChildren5)); // true
}

// ============================================
// Example 9: Provider Props Validation
// ============================================

/**
 * Validating provider props
 */
export function example9_ProviderValidation() {
    const invalidProps1 = {}; // ❌ Missing children
    const invalidProps2 = { children: null }; // ✅ Valid (null is valid ReactNode)
    const invalidProps3 = { children: "Hello" }; // ✅ Valid

    console.log(isValidProviderProps(invalidProps1)); // false
    console.log(isValidProviderProps(invalidProps2)); // true
    console.log(isValidProviderProps(invalidProps3)); // true
}

// ============================================
// Example 10: Real-World Integration Pattern
// ============================================

/**
 * Complete example showing protection at all boundaries
 */
export function example10_CompleteIntegration(
    externalData: unknown,
    contextValue: unknown
) {
    // 1. Validate external data at entry point
    if (!isValidStoreItemProps(externalData)) {
        console.error('Invalid data from API');
        return { error: 'Invalid data' };
    }

    const props = externalData; // TypeScript knows this is StoreItemProps

    // 2. Validate ID from props
    if (!isValidId(props.id)) {
        console.error('Invalid ID in props');
        return { error: 'Invalid ID' };
    }

    // 3. Validate context is initialized
    if (!isShoppingCartContext(contextValue)) {
        console.error('Context not initialized');
        return { error: 'Context error' };
    }

    const context = contextValue; // TypeScript knows this is ShoppingCartContextType

    // 4. All validations passed - safe to use
    const quantity = context.getItemQuantity(props.id);

    return {
        success: true,
        item: props,
        quantity
    };
}

// ============================================
// Example 11: Defensive Programming Pattern
// ============================================

/**
 * Function that accepts data from external source
 * Validates at every boundary
 */
export function example11_DefensiveProgramming(
    itemData: unknown,
    itemId: unknown,
    qty: unknown
) {
    // Validate each parameter at the boundary
    const errors: string[] = [];

    if (!isValidStoreItemProps(itemData)) {
        errors.push('Invalid item data');
    }

    if (!isValidId(itemId)) {
        errors.push('Invalid item ID');
    }

    if (!isValidQuantity(qty)) {
        errors.push('Invalid quantity');
    }

    // Early return if any validation failed
    if (errors.length > 0) {
        console.error('Validation errors:', errors);
        return { success: false, errors };
    }

    // All type guards passed - safe to use
    const item = itemData as StoreItemProps;
    const id = itemId as number;
    const quantity = qty as number;

    return {
        success: true,
        data: {
            item,
            id,
            quantity
        }
    };
}

// ============================================
// Example 12: Testing Context Integration
// ============================================

/**
 * Mock context for testing
 */
const mockValidContext: ShoppingCartContextType = {
    openCart: () => {},
    closeCart: () => {},
    getItemQuantity: () => 0,
    increaseCartQuantity: () => {},
    decreaseCartQuantity: () => {},
    removeFromCart: () => {},
    cartQuantity: 0,
    cartItems: []
};

/**
 * Testing context validation
 */
export function example12_TestingContext() {
    const invalidContext1 = {};
    const invalidContext2 = null;
    const invalidContext3 = { cartItems: [] }; // Missing other props
    const validContext = mockValidContext;

    console.log('Test 1:', isShoppingCartContext(invalidContext1)); // false
    console.log('Test 2:', isShoppingCartContext(invalidContext2)); // false
    console.log('Test 3:', isShoppingCartContext(invalidContext3)); // false
    console.log('Test 4:', isShoppingCartContext(validContext));    // true

    // Use in tests
    if (isShoppingCartContext(validContext)) {
        // Safe to use all context methods
        validContext.increaseCartQuantity(1);
        console.log('Cart quantity:', validContext.cartQuantity);
    }
}

// ============================================
// Example 13: API Response Validation Pattern
// ============================================

/**
 * Validating data from API responses
 */
export async function example13_APIResponseValidation() {
    // Simulating API call
    const apiResponse: unknown = await Promise.resolve({
        items: [
            { id: 1, name: "Book", price: 10.99, imgUrl: "/img/book.png" },
            { id: "bad", name: "", price: -5, imgUrl: "" }, // ❌ Invalid
            { id: 2, name: "Computer", price: 1199, imgUrl: "/img/pc.png" }
        ]
    });

    if (typeof apiResponse !== 'object' || apiResponse === null) {
        return { error: 'Invalid API response' };
    }

    const response = apiResponse as { items: unknown[] };

    if (!Array.isArray(response.items)) {
        return { error: 'Items is not an array' };
    }

    // Validate each item
    const validItems: StoreItemProps[] = [];
    const invalidItems: unknown[] = [];

    for (const item of response.items) {
        if (isValidStoreItemProps(item)) {
            validItems.push(item);
        } else {
            invalidItems.push(item);
        }
    }

    return {
        validItems,   // Safe to use
        invalidItems, // Log for debugging
        hasErrors: invalidItems.length > 0
    };
}
