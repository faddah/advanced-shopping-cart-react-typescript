/**
 * Type Guards for Runtime Type Validation
 * These ensure data from external sources (localStorage, JSON files) matches expected types
 */

// ============================================
// CartItem Type Guards (for localStorage)
// ============================================

export interface CartItem {
  id: number;
  quantity: number;
}

/**
 * Type guard to check if a value is a valid CartItem
 */
export function isCartItem(value: unknown): value is CartItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'quantity' in value &&
    typeof (value as CartItem).id === 'number' &&
    typeof (value as CartItem).quantity === 'number' &&
    (value as CartItem).quantity > 0 && // Ensure quantity is positive
    Number.isInteger((value as CartItem).id) && // Ensure id is an integer
    Number.isInteger((value as CartItem).quantity) // Ensure quantity is an integer
  );
}

/**
 * Type guard to check if a value is a valid array of CartItems
 */
export function isCartItemArray(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) {
    console.warn('Expected array, received:', typeof value);
    return false;
  }

  const invalidItems = value.filter((item, index) => {
    const valid = isCartItem(item);
    if (!valid) {
      console.warn(`Invalid CartItem at index ${index}:`, item);
    }
    return !valid;
  });

  return invalidItems.length === 0;
}

// ============================================
// StoreItem Type Guards (for JSON imports)
// ============================================

export interface StoreItem {
  id: number;
  name: string;
  price: number;
  imgUrl: string;
}

/**
 * Type guard to check if a value is a valid StoreItem
 */
export function isStoreItem(value: unknown): value is StoreItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as StoreItem;

  return (
    'id' in value &&
    'name' in value &&
    'price' in value &&
    'imgUrl' in value &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.imgUrl === 'string' &&
    Number.isInteger(item.id) && // Ensure id is an integer
    item.id > 0 && // Ensure id is positive
    item.name.trim().length > 0 && // Ensure name is not empty
    item.price >= 0 && // Ensure price is non-negative
    item.imgUrl.trim().length > 0 // Ensure imgUrl is not empty
  );
}

/**
 * Type guard to check if a value is a valid array of StoreItems
 */
export function isStoreItemArray(value: unknown): value is StoreItem[] {
  if (!Array.isArray(value)) {
    console.error('Store items data is not an array');
    return false;
  }

  if (value.length === 0) {
    console.warn('Store items array is empty');
    return false;
  }

  const invalidItems = value.filter((item, index) => {
    const valid = isStoreItem(item);
    if (!valid) {
      console.error(`Invalid StoreItem at index ${index}:`, item);
    }
    return !valid;
  });

  if (invalidItems.length > 0) {
    console.error(`Found ${invalidItems.length} invalid store items`);
    return false;
  }

  // Check for duplicate IDs
  const ids = value.map(item => (item as StoreItem).id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.error('Duplicate IDs found in store items');
    return false;
  }

  return true;
}

/**
 * Validates and returns store items, throwing an error if validation fails
 * Use this when you want to fail fast during application initialization
 */
export function validateStoreItems(items: unknown): StoreItem[] {
  if (!isStoreItemArray(items)) {
    throw new Error(
      'Invalid store items data structure. Check console for details.'
    );
  }
  return items;
}

// ============================================
// Optional Value Type Guards (for .find() operations)
// ============================================

/**
 * Generic type guard to check if a value is not null or undefined
 * This is useful for narrowing types after .find() operations
 *
 * @example
 * const item = items.find(i => i.id === 1);
 * if (isDefined(item)) {
 *   // TypeScript now knows item is not undefined
 *   console.log(item.name);
 * }
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard specifically for checking if a value exists (not null/undefined)
 * Alias for isDefined with a more semantic name
 */
export function exists<T>(value: T | null | undefined): value is T {
  return isDefined(value);
}

/**
 * Type guard to check if a value is null or undefined
 * Opposite of isDefined
 */
export function isNullish<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Finds an item by ID in an array with proper type narrowing
 * Returns the item or undefined if not found
 *
 * @example
 * const item = findById(storeItems, 1);
 * if (isDefined(item)) {
 *   console.log(item.name);
 * }
 */
export function findById<T extends { id: number }>(
  items: T[],
  id: number
): T | undefined {
  return items.find(item => item.id === id);
}

/**
 * Finds an item by ID and asserts it exists
 * Throws an error if the item is not found
 * Use this when you expect the item to always exist
 *
 * @throws {Error} If item with given ID is not found
 *
 * @example
 * const item = findByIdOrThrow(storeItems, 1, 'StoreItem');
 * // TypeScript knows item is defined here (no need to check for undefined)
 * console.log(item.name);
 */
export function findByIdOrThrow<T extends { id: number }>(
  items: T[],
  id: number,
  itemType: string = 'Item'
): T {
  const item = items.find(item => item.id === id);
  if (!isDefined(item)) {
    throw new Error(`${itemType} with id ${id} not found`);
  }
  return item;
}

/**
 * Finds an item by ID and returns it with a fallback if not found
 * Guarantees a non-undefined return value
 *
 * @example
 * const item = findByIdOrDefault(storeItems, 1, defaultItem);
 * // item is always defined
 * console.log(item.name);
 */
export function findByIdOrDefault<T extends { id: number }>(
  items: T[],
  id: number,
  defaultValue: T
): T {
  const item = items.find(item => item.id === id);
  return isDefined(item) ? item : defaultValue;
}

/**
 * Type guard to check if an item exists in an array by ID
 * Useful for conditional logic
 *
 * @example
 * if (hasItemWithId(cartItems, 5)) {
 *   console.log('Item already in cart');
 * }
 */
export function hasItemWithId<T extends { id: number }>(
  items: T[],
  id: number
): boolean {
  return items.some(item => item.id === id);
}

/**
 * Assertion function that throws if a value is nullish
 * Used to assert that a value exists after a .find() operation
 *
 * @throws {Error} If value is null or undefined
 *
 * @example
 * const item = items.find(i => i.id === 1);
 * assertDefined(item, 'Expected item to exist');
 * // TypeScript knows item is defined after this line
 * console.log(item.name);
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = 'Expected value to be defined'
): asserts value is T {
  if (isNullish(value)) {
    throw new Error(message);
  }
}

/**
 * Type guard that checks if a StoreItem exists by ID
 * Combines finding and type checking
 *
 * @example
 * const itemOrUndefined = items.find(i => i.id === id);
 * if (isStoreItemDefined(itemOrUndefined)) {
 *   console.log(itemOrUndefined.name); // Safe access
 * }
 */
export function isStoreItemDefined(
  item: StoreItem | undefined
): item is StoreItem {
  return isDefined(item) && isStoreItem(item);
}

/**
 * Type guard that checks if a CartItem exists by ID
 * Combines finding and type checking
 */
export function isCartItemDefined(
  item: CartItem | undefined
): item is CartItem {
  return isDefined(item) && isCartItem(item);
}

// ============================================
// External Boundary Type Guards (Context & Props)
// ============================================

/**
 * Type guard to validate React Context has been properly initialized
 * Checks if context value is not an empty object
 */
export function isContextInitialized<T extends object>(
  context: T,
  requiredKeys: (keyof T)[]
): context is T {
  // Check if context is not just an empty object
  if (Object.keys(context).length === 0) {
    return false;
  }

  // Check if all required keys exist in the context
  for (const key of requiredKeys) {
    if (!(key in context)) {
      console.error(`Context missing required key: ${String(key)}`);
      return false;
    }
  }

  return true;
}

/**
 * Type guard for ShoppingCart Context validation
 * Validates that the context has all required methods and properties
 */
export interface ShoppingCartContextType {
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (id: number) => number;
  increaseCartQuantity: (id: number) => void;
  decreaseCartQuantity: (id: number) => void;
  removeFromCart: (id: number) => void;
  cartQuantity: number;
  cartItems: CartItem[];
}

/**
 * Type guard to check if a value is a valid ShoppingCartContext
 * Performs comprehensive validation of all methods and properties
 */
export function isShoppingCartContext(
  value: unknown
): value is ShoppingCartContextType {
  if (typeof value !== 'object' || value === null) {
    console.error('ShoppingCartContext: Expected object, received:', typeof value);
    return false;
  }

  const context = value as ShoppingCartContextType;

  // Check all required methods exist and are functions
  const requiredMethods = [
    'openCart',
    'closeCart',
    'getItemQuantity',
    'increaseCartQuantity',
    'decreaseCartQuantity',
    'removeFromCart'
  ];

  for (const method of requiredMethods) {
    if (!(method in context)) {
      console.error(`ShoppingCartContext: Missing required method: ${method}`);
      return false;
    }
    if (typeof context[method as keyof ShoppingCartContextType] !== 'function') {
      console.error(`ShoppingCartContext: ${method} is not a function`);
      return false;
    }
  }

  // Check cartQuantity is a number
  if (!('cartQuantity' in context)) {
    console.error('ShoppingCartContext: Missing cartQuantity property');
    return false;
  }
  if (typeof context.cartQuantity !== 'number') {
    console.error('ShoppingCartContext: cartQuantity must be a number');
    return false;
  }
  if (!Number.isFinite(context.cartQuantity) || context.cartQuantity < 0) {
    console.error('ShoppingCartContext: cartQuantity must be a non-negative finite number');
    return false;
  }

  // Check cartItems is an array
  if (!('cartItems' in context)) {
    console.error('ShoppingCartContext: Missing cartItems property');
    return false;
  }
  if (!Array.isArray(context.cartItems)) {
    console.error('ShoppingCartContext: cartItems must be an array');
    return false;
  }

  // Validate cartItems structure
  if (!isCartItemArray(context.cartItems)) {
    console.error('ShoppingCartContext: cartItems array contains invalid items');
    return false;
  }

  return true;
}

/**
 * Asserts that ShoppingCartContext is properly initialized
 * Throws a descriptive error if used outside provider
 */
export function assertShoppingCartContext(
  context: unknown
): asserts context is ShoppingCartContextType {
  if (!isShoppingCartContext(context)) {
    throw new Error(
      'useShoppingCart must be used within ShoppingCartProvider. ' +
      'Make sure your component is wrapped in <ShoppingCartProvider>.\n' +
      'Check the console for detailed validation errors.'
    );
  }
}

/**
 * Validates that a context value object has all required properties
 * before being passed to Provider
 */
export function validateContextValue(
  value: unknown,
  contextName: string = 'Context'
): value is ShoppingCartContextType {
  if (!isShoppingCartContext(value)) {
    console.error(`${contextName}: Invalid context value structure`);
    return false;
  }

  // Additional validation: ensure functions are bound correctly
  const context = value as ShoppingCartContextType;

  try {
    // Test that methods don't throw immediately (basic smoke test)
    // This doesn't call them, just checks they're callable
    const methodTests = [
      () => typeof context.openCart === 'function',
      () => typeof context.closeCart === 'function',
      () => typeof context.getItemQuantity === 'function',
      () => typeof context.increaseCartQuantity === 'function',
      () => typeof context.decreaseCartQuantity === 'function',
      () => typeof context.removeFromCart === 'function'
    ];

    for (const test of methodTests) {
      if (!test()) {
        console.error(`${contextName}: Method validation failed`);
        return false;
      }
    }
  } catch (error) {
    console.error(`${contextName}: Error during method validation:`, error);
    return false;
  }

  return true;
}

/**
 * Development-time helper to log context structure
 * Only active in development mode
 */
export function logContextStructure(
  context: unknown,
  label: string = 'Context'
): void {
  if (import.meta.env.DEV) {
    console.group(`${label} Structure`);

    if (!isShoppingCartContext(context)) {
      console.error('❌ Invalid context structure');
      console.log('Received:', context);
    } else {
      console.log('✅ Valid context structure');
      const ctx = context as ShoppingCartContextType;
      console.log('Methods:', {
        openCart: typeof ctx.openCart,
        closeCart: typeof ctx.closeCart,
        getItemQuantity: typeof ctx.getItemQuantity,
        increaseCartQuantity: typeof ctx.increaseCartQuantity,
        decreaseCartQuantity: typeof ctx.decreaseCartQuantity,
        removeFromCart: typeof ctx.removeFromCart
      });
      console.log('Properties:', {
        cartQuantity: ctx.cartQuantity,
        cartItemsCount: ctx.cartItems.length
      });
    }

    console.groupEnd();
  }
}

/**
 * Type guard for validating context method signatures
 * Ensures methods accept correct parameter types
 */
export function hasValidContextMethodSignatures(
  context: unknown
): context is ShoppingCartContextType {
  if (!isShoppingCartContext(context)) {
    return false;
  }

  const ctx = context as ShoppingCartContextType;

  // Validate that ID-accepting methods are callable
  try {
    // These should be functions that accept a number
    const idMethods = [
      ctx.getItemQuantity,
      ctx.increaseCartQuantity,
      ctx.decreaseCartQuantity,
      ctx.removeFromCart
    ];

    for (const method of idMethods) {
      if (typeof method !== 'function') {
        console.error('Context method is not a function');
        return false;
      }
      // Check function has correct length (arity)
      if (method.length !== 1) {
        console.warn('Context method has unexpected arity:', method.length);
      }
    }

    // Validate no-arg methods
    const noArgMethods = [ctx.openCart, ctx.closeCart];
    for (const method of noArgMethods) {
      if (typeof method !== 'function') {
        console.error('Context method is not a function');
        return false;
      }
      if (method.length !== 0) {
        console.warn('No-arg method has unexpected arity:', method.length);
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating method signatures:', error);
    return false;
  }
}

/**
 * Checks if context is using default/empty value (not provided)
 */
export function isContextDefaultValue(context: unknown): boolean {
  // Context is default if it's undefined, null, or empty object
  if (context === undefined || context === null) {
    return true;
  }

  if (typeof context === 'object' && Object.keys(context).length === 0) {
    return true;
  }

  return false;
}

/**
 * Type guard for StoreItem props validation
 * Ensures props passed to StoreItem component are valid
 */
export interface StoreItemProps {
  id: number;
  name: string;
  price: number;
  imgUrl: string;
}

/**
 * Validates StoreItem props at runtime
 */
export function isValidStoreItemProps(
  props: unknown
): props is StoreItemProps {
  if (typeof props !== 'object' || props === null) {
    console.error('StoreItem props must be an object');
    return false;
  }

  const p = props as StoreItemProps;

  if (!('id' in p) || typeof p.id !== 'number' || !Number.isInteger(p.id) || p.id <= 0) {
    console.error('StoreItem props: id must be a positive integer');
    return false;
  }

  if (!('name' in p) || typeof p.name !== 'string' || p.name.trim().length === 0) {
    console.error('StoreItem props: name must be a non-empty string');
    return false;
  }

  if (!('price' in p) || typeof p.price !== 'number' || p.price < 0) {
    console.error('StoreItem props: price must be a non-negative number');
    return false;
  }

  if (!('imgUrl' in p) || typeof p.imgUrl !== 'string' || p.imgUrl.trim().length === 0) {
    console.error('StoreItem props: imgUrl must be a non-empty string');
    return false;
  }

  return true;
}

/**
 * Validates StoreItem props and throws if invalid
 */
export function validateStoreItemProps(props: unknown): StoreItemProps {
  if (!isValidStoreItemProps(props)) {
    throw new Error('Invalid StoreItem props. Check console for details.');
  }
  return props;
}

/**
 * Type guard for React children prop
 * Validates that children prop is valid React content
 */
export function isValidReactChildren(
  children: unknown
): children is React.ReactNode {
  // React.ReactNode can be:
  // - null, undefined (valid - renders nothing)
  // - boolean (valid - renders nothing)
  // - number, string (valid - renders as text)
  // - React element (valid)
  // - Array of any of the above (valid)

  if (children === null || children === undefined) {
    return true;
  }

  if (typeof children === 'boolean') {
    return true;
  }

  if (typeof children === 'string' || typeof children === 'number') {
    return true;
  }

  if (Array.isArray(children)) {
    return true; // Assume array is valid ReactNode array
  }

  if (typeof children === 'object') {
    return true; // Assume object is React element
  }

  return false;
}

/**
 * Type guard for provider props validation
 * Ensures provider receives valid children
 */
export interface ProviderProps {
  children: React.ReactNode;
}

/**
 * Validates provider props
 */
export function isValidProviderProps(props: unknown): props is ProviderProps {
  if (typeof props !== 'object' || props === null) {
    console.error('Provider props must be an object');
    return false;
  }

  const p = props as ProviderProps;

  if (!('children' in p)) {
    console.error('Provider props must include children');
    return false;
  }

  if (!isValidReactChildren(p.children)) {
    console.error('Provider children must be valid React content');
    return false;
  }

  return true;
}

/**
 * Type guard to check if a numeric ID is valid
 * Used at component boundaries to validate IDs from external sources
 */
export function isValidId(id: unknown): id is number {
  return (
    typeof id === 'number' &&
    Number.isInteger(id) &&
    id > 0 &&
    Number.isFinite(id)
  );
}

/**
 * Validates and converts unknown ID to number
 * Throws if ID is invalid
 */
export function validateId(id: unknown, context: string = 'ID'): number {
  if (!isValidId(id)) {
    throw new Error(
      `${context} must be a positive integer, received: ${JSON.stringify(id)}`
    );
  }
  return id;
}

/**
 * Type guard for quantity values
 * Ensures quantity is a valid positive integer
 */
export function isValidQuantity(quantity: unknown): quantity is number {
  return (
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    Number.isFinite(quantity)
  );
}

/**
 * Validates quantity value
 */
export function validateQuantity(quantity: unknown): number {
  if (!isValidQuantity(quantity)) {
    throw new Error(
      `Quantity must be a positive integer, received: ${JSON.stringify(quantity)}`
    );
  }
  return quantity;
}

// ============================================
// Function Type Discrimination Type Guards
// ============================================

/**
 * Type guard to check if a value is a function
 * More type-safe than typeof check alone
 *
 * @example
 * const value = someValue;
 * if (isFunction(value)) {
 *   value(); // TypeScript knows value is a function
 * }
 */
export function isFunction<T = unknown>(
  value: unknown
): value is (...args: unknown[]) => T {
  return typeof value === 'function';
}

/**
 * Type guard to check if a value is a function that takes no parameters
 * Used for lazy initialization patterns
 *
 * @example
 * const initializer = () => ({ items: [] });
 * if (isNullaryFunction(initializer)) {
 *   const result = initializer(); // TypeScript knows it takes no args
 * }
 */
export function isNullaryFunction<T>(
  value: unknown
): value is () => T {
  return typeof value === 'function';
}

/**
 * Type guard for discriminating between a value and a function that returns that value
 * Common pattern in React hooks and lazy initialization
 *
 * @example
 * function useState<T>(initial: T | (() => T)) {
 *   if (isFunctionReturning<T>(initial)) {
 *     return initial(); // TypeScript knows this is () => T
 *   }
 *   return initial; // TypeScript knows this is T
 * }
 */
export function isFunctionReturning<T>(
  value: T | (() => T)
): value is () => T {
  return typeof value === 'function';
}

/**
 * Type guard for updater functions (common in React state setters)
 * Discriminates between a direct value and an updater function
 *
 * @example
 * function setCartItems(update: CartItem[] | ((prev: CartItem[]) => CartItem[])) {
 *   if (isUpdaterFunction(update)) {
 *     const newItems = update(currentItems);
 *     // ...
 *   } else {
 *     const newItems = update;
 *     // ...
 *   }
 * }
 */
export function isUpdaterFunction<T>(
  value: T | ((prev: T) => T)
): value is (prev: T) => T {
  return typeof value === 'function';
}

/**
 * Safely invokes a value that might be a function or a direct value
 * Returns the result in either case
 *
 * @example
 * const config = { timeout: 5000 };
 * const lazyConfig = () => ({ timeout: 5000 });
 *
 * const result1 = resolveValue(config);      // { timeout: 5000 }
 * const result2 = resolveValue(lazyConfig);  // { timeout: 5000 }
 */
export function resolveValue<T>(value: T | (() => T)): T {
  if (isFunctionReturning<T>(value)) {
    return value();
  }
  return value;
}

/**
 * Type guard to distinguish between async and sync functions
 */
export function isAsyncFunction<T = unknown>(
  value: unknown
): value is (...args: unknown[]) => Promise<T> {
  return (
    typeof value === 'function' &&
    value.constructor.name === 'AsyncFunction'
  );
}

/**
 * Type guard to check if a value is a class constructor
 */
export function isConstructor(value: unknown): value is new (...args: unknown[]) => unknown {
  return (
    typeof value === 'function' &&
    value.prototype !== undefined &&
    value.prototype.constructor === value
  );
}
