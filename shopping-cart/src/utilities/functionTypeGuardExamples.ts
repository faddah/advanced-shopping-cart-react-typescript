/**
 * Function Type Discrimination Examples
 * Demonstrates how type guards improve function type checking
 */

import {
    isFunction,
    isNullaryFunction,
    isFunctionReturning,
    isUpdaterFunction,
    resolveValue,
    isAsyncFunction,
    isConstructor
} from "./typeGuards";

// ============================================
// Example 1: Basic Function Check
// ============================================

/**
 * PROBLEM: typeof check doesn't narrow types well
 */
export function example1_BasicFunctionCheck() {
    const value1 = "hello";
    const value2 = () => "hello";

    // WITHOUT type guard
    if (typeof value2 === 'function') {
        // TypeScript still treats this as generic Function
        const result = value2(); // Works but no strong typing
    }

    // WITH type guard
    if (isFunction<string>(value2)) {
        // TypeScript knows this returns string
        const result = value2(); // ✅ Strongly typed as string
        return result.toUpperCase(); // ✅ String methods available
    }
}

// ============================================
// Example 2: Lazy Initialization Pattern (React useState)
// ============================================

/**
 * Pattern used in React hooks for lazy initial state
 */
export function example2_LazyInitialization<T>(
    initialValue: T | (() => T)
): T {
    // WITHOUT type guard - needs type assertion
    // return typeof initialValue === 'function'
    //   ? (initialValue as () => T)()  // ❌ Type assertion needed
    //   : initialValue;

    // WITH type guard - clean and type-safe
    if (isFunctionReturning<T>(initialValue)) {
        return initialValue(); // ✅ TypeScript knows it's () => T
    } else {
        return initialValue; // ✅ TypeScript knows it's T
    }
}

/**
 * Real-world usage example
 */
export function example2b_UsageExample() {
    // Direct value
    const value1 = example2_LazyInitialization(42);
    console.log(value1); // 42

    // Lazy function
    const value2 = example2_LazyInitialization(() => {
        console.log('Computing initial value...');
        return 42;
    });
    console.log(value2); // 42 (after computing)
}

// ============================================
// Example 3: React State Updater Pattern
// ============================================

/**
 * Pattern used in setState for functional updates
 */
export function example3_StateUpdater<T>(
    currentState: T,
    update: T | ((prev: T) => T)
): T {
    // WITHOUT type guard
    // return typeof update === 'function'
    //   ? (update as (prev: T) => T)(currentState)  // ❌ Type assertion
    //   : update;

    // WITH type guard
    if (isUpdaterFunction<T>(update)) {
        return update(currentState); // ✅ TypeScript knows signature
    } else {
        return update; // ✅ TypeScript knows it's T
    }
}

/**
 * Real-world usage in a shopping cart
 */
export function example3b_CartUpdaterExample() {
    interface CartItem {
        id: number;
        quantity: number;
    }

    let cartItems: CartItem[] = [{ id: 1, quantity: 2 }];

    // Direct update
    const newCart1 = example3_StateUpdater(cartItems, [
        { id: 1, quantity: 3 }
    ]);

    // Functional update
    const newCart2 = example3_StateUpdater(cartItems, (prev) => [
        ...prev,
        { id: 2, quantity: 1 }
    ]);

    console.log(newCart1, newCart2);
}

// ============================================
// Example 4: useLocalStorage Hook Pattern
// ============================================

/**
 * Simplified version of useLocalStorage showing type guards
 */
export function example4_LocalStoragePattern<T>(
    key: string,
    initialValue: T | (() => T)
): T {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
    }

    // Use type guard to handle initial value
    if (isFunctionReturning<T>(initialValue)) {
        return initialValue(); // ✅ Invoke function
    }
    return initialValue; // ✅ Return value directly
}

/**
 * Usage examples
 */
export function example4b_LocalStorageUsage() {
    // With direct value
    const cart1 = example4_LocalStoragePattern('cart', []);

    // With lazy function (computed only if needed)
    const cart2 = example4_LocalStoragePattern('cart', () => {
        console.log('Computing default cart...');
        return [];
    });
}

// ============================================
// Example 5: Nullary Function Type Guard
// ============================================

/**
 * Checking functions with no parameters
 */
export function example5_NullaryFunctions() {
    const func1 = () => 42;
    const func2 = (x: number) => x * 2;
    const value = 42;

    // Type guard for functions with no params
    if (isNullaryFunction<number>(func1)) {
        const result = func1(); // ✅ Can call without args
        console.log(result);
    }

    // This would also pass (can't distinguish arity at runtime)
    if (isNullaryFunction(func2)) {
        // At runtime, this passes but we know it needs an arg
        // TypeScript typing helps document intent
    }

    if (isNullaryFunction(value)) {
        // This correctly fails
        console.log('Not a function');
    }
}

// ============================================
// Example 6: Async Function Detection
// ============================================

/**
 * Discriminating between sync and async functions
 */
export function example6_AsyncFunctions() {
    const syncFunc = () => 42;
    const asyncFunc = async () => 42;

    if (isAsyncFunction<number>(asyncFunc)) {
        // TypeScript knows this returns Promise<number>
        asyncFunc().then(result => console.log(result));
    }

    if (isAsyncFunction(syncFunc)) {
        // This is false - syncFunc is not async
        console.log('Not async');
    } else {
        console.log('Sync function');
    }
}

/**
 * Using async detection for different handling
 */
export async function example6b_AsyncHandling<T>(
    operation: (() => T) | (() => Promise<T>)
): Promise<T> {
    if (isAsyncFunction<T>(operation)) {
        // Handle async operation
        return await operation();
    } else {
        // Handle sync operation (wrap in Promise)
        return Promise.resolve(operation());
    }
}

// ============================================
// Example 7: Constructor Detection
// ============================================

/**
 * Distinguishing between functions and classes
 */
export function example7_ConstructorDetection() {
    class MyClass {
        name: string;
        constructor(name: string) {
            this.name = name;
        }
    }

    const regularFunc = () => {};
    const classConstructor = MyClass;

    if (isConstructor(classConstructor)) {
        // TypeScript knows this is a constructor
        const instance = new classConstructor('test');
        console.log(instance.name);
    }

    if (isConstructor(regularFunc)) {
        // This is false - regularFunc is not a constructor
        console.log('Not a constructor');
    }
}

// ============================================
// Example 8: Resolve Value Helper
// ============================================

/**
 * Using resolveValue helper for cleaner code
 */
export function example8_ResolveValue() {
    interface Config {
        timeout: number;
        retries: number;
    }

    const directConfig: Config = { timeout: 5000, retries: 3 };
    const lazyConfig: () => Config = () => ({ timeout: 5000, retries: 3 });

    // WITHOUT helper - manual type checking
    const config1 = typeof directConfig === 'function'
        ? directConfig()
        : directConfig;

    // WITH helper - clean and simple
    const config2 = resolveValue(directConfig);   // { timeout: 5000, retries: 3 }
    const config3 = resolveValue(lazyConfig);     // { timeout: 5000, retries: 3 }

    console.log(config2, config3);
}

// ============================================
// Example 9: Type Guard Composition
// ============================================

/**
 * Combining multiple type guards
 */
export function example9_TypeGuardComposition<T>(
    value: T | (() => T) | (() => Promise<T>)
): T | Promise<T> {
    // Check if it's a function first
    if (!isFunction(value)) {
        return value; // Direct value
    }

    // Check if it's async
    if (isAsyncFunction<T>(value)) {
        return value(); // Returns Promise<T>
    }

    // Must be sync function
    if (isFunctionReturning<T>(value)) {
        return value(); // Returns T
    }

    // Fallback (shouldn't reach here)
    return value as T;
}

// ============================================
// Example 10: Real-World Custom Hook
// ============================================

/**
 * Custom hook pattern with function type guards
 */
export function example10_CustomHook<T>(
    initialValue: T | (() => T),
    validator?: (value: T) => boolean
) {
    // Initialize value with type guard
    const getValue = (): T => {
        if (isFunctionReturning<T>(initialValue)) {
            const computed = initialValue();

            // Validate if validator provided
            if (validator && !validator(computed)) {
                throw new Error('Initial value validation failed');
            }

            return computed;
        }

        // Validate direct value
        if (validator && !validator(initialValue)) {
            throw new Error('Initial value validation failed');
        }

        return initialValue;
    };

    return getValue();
}

/**
 * Usage example
 */
export function example10b_CustomHookUsage() {
    // With direct value
    const value1 = example10_CustomHook(42, (v) => v > 0);

    // With lazy function
    const value2 = example10_CustomHook(
        () => Math.random() * 100,
        (v) => v > 0
    );

    console.log(value1, value2);
}

// ============================================
// Example 11: Before vs After Comparison
// ============================================

/**
 * BEFORE: Using type assertions (not recommended)
 */
export function example11_Before<T>(value: T | (() => T)): T {
    // ❌ Using type assertion
    return typeof value === 'function'
        ? (value as () => T)()
        : value;
}

/**
 * AFTER: Using type guard (recommended)
 */
export function example11_After<T>(value: T | (() => T)): T {
    // ✅ Using type guard
    if (isFunctionReturning<T>(value)) {
        return value();
    }
    return value;
}

/**
 * Benefits comparison
 */
export function example11c_BenefitsComparison() {
    console.log('BEFORE (Type Assertions):');
    console.log('- Uses "as" keyword');
    console.log('- Bypasses type checking');
    console.log('- Less clear intent');
    console.log('- Could mask errors');

    console.log('\nAFTER (Type Guards):');
    console.log('✅ Runtime type checking');
    console.log('✅ Type narrowing');
    console.log('✅ Clear intent');
    console.log('✅ Type-safe');
}

// ============================================
// Example 12: Error Handling with Type Guards
// ============================================

/**
 * Better error handling with type guards
 */
export function example12_ErrorHandling<T>(
    value: T | (() => T),
    context: string = 'value'
): T {
    try {
        if (isFunctionReturning<T>(value)) {
            // We know it's a function, can add specific error handling
            try {
                return value();
            } catch (funcError) {
                throw new Error(
                    `Error executing ${context} function: ${funcError}`
                );
            }
        }
        return value;
    } catch (error) {
        console.error(`Error resolving ${context}:`, error);
        throw error;
    }
}

// ============================================
// Example 13: TypeScript Inference Benefits
// ============================================

/**
 * Type guard enables better TypeScript inference
 */
export function example13_TypeInference() {
    interface User {
        name: string;
        age: number;
    }

    const directUser: User = { name: 'Alice', age: 30 };
    const lazyUser: () => User = () => ({ name: 'Bob', age: 25 });

    // With type guard, TypeScript infers correctly
    if (isFunctionReturning<User>(lazyUser)) {
        const user = lazyUser();
        // TypeScript knows all User properties are available
        console.log(user.name.toUpperCase()); // ✅
        console.log(user.age.toFixed(0));     // ✅
    }

    if (!isFunctionReturning<User>(directUser)) {
        // TypeScript knows this is User, not () => User
        console.log(directUser.name.toUpperCase()); // ✅
        console.log(directUser.age.toFixed(0));     // ✅
    }
}
