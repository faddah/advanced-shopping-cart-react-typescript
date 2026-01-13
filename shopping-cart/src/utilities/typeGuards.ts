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
