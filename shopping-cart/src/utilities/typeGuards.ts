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
