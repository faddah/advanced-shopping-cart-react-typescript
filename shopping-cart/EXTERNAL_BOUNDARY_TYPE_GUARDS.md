# External Boundary Type Guards Implementation

## Overview

This document details TypeScript Type Guards implemented for **external boundaries** - points where data enters your application from outside sources (Context API, component props, user input, etc.). These guards catch integration errors early before they propagate through your application.

---

## 🎯 Problem Solved

External boundaries are where most integration bugs occur:

```typescript
// ❌ UNSAFE - Using context outside provider
const { cartItems } = useShoppingCart(); // Crashes if used outside provider

// ❌ UNSAFE - Invalid props from external data
const item = { id: "not-a-number", price: -10 }; // Wrong types
<StoreItem {...item} /> // Crashes at runtime

// ❌ UNSAFE - Invalid IDs from URL params
const id = params.id; // Could be anything
getItemQuantity(id); // Might crash
```

## ✅ Solution: Boundary Type Guards

Type Guards at boundaries validate data as it enters your application, providing:

- Runtime validation before data flows through your app
- Clear error messages at the integration point
- Type narrowing for TypeScript safety
- Fail-fast behavior preventing cascading errors

---

## 📦 Type Guards Added

### **Context Validation**

Located in: `src/utilities/typeGuards.ts`

#### 1. `isShoppingCartContext(value: unknown): value is ShoppingCartContextType`

Validates that a value is a properly initialized ShoppingCartContext.

```typescript
const context = useContext(ShoppingCartContext);
if (!isShoppingCartContext(context)) {
  throw new Error('useShoppingCart must be used within ShoppingCartProvider');
}
// TypeScript knows context is valid here
```

**What it checks:**

- ✅ Context is not null/undefined
- ✅ Has all required methods (openCart, closeCart, etc.)
- ✅ All methods are functions
- ✅ Has required properties (cartQuantity, cartItems)
- ✅ cartQuantity is a number
- ✅ cartItems is an array

#### 2. `assertShoppingCartContext(context: unknown): asserts context is ShoppingCartContextType`

Assertion function that throws if context is invalid. Used in the `useShoppingCart` hook.

```typescript
// In useShoppingCart hook
export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  assertShoppingCartContext(context); // Throws if invalid
  return context; // TypeScript knows it's valid
}
```

**Error thrown:**

```text
Error: useShoppingCart must be used within ShoppingCartProvider.
Make sure your component is wrapped in <ShoppingCartProvider>.
```

---

### **Props Validation**

#### 3. `isValidStoreItemProps(props: unknown): props is StoreItemProps`

Validates StoreItem component props from external sources.

```typescript

const externalData = fetchFromAPI(); // Could be anything
if (isValidStoreItemProps(externalData)) {
  return <StoreItem {...externalData} />; // ✅ Safe
}
```

**What it checks:**

- ✅ id: positive integer
- ✅ name: non-empty string
- ✅ price: non-negative number
- ✅ imgUrl: non-empty string

#### 4. `validateStoreItemProps(props: unknown): StoreItemProps`

Strict validation that throws on invalid props.

```typescript
const props = validateStoreItemProps(externalData);
// Throws if invalid, returns typed props if valid
```

---

### **ID Validation**

#### 5. `isValidId(id: unknown): id is number`

Validates numeric IDs from external sources (URL params, user input, etc.).

```typescript
const urlParamId = searchParams.get('id');
if (isValidId(urlParamId)) {
  // TypeScript knows urlParamId is a valid number
  getItemQuantity(urlParamId);
}
```

**What it checks:**

- ✅ Is a number
- ✅ Is an integer
- ✅ Is positive (> 0)
- ✅ Is finite (not NaN or Infinity)

#### 6. `validateId(id: unknown, context?: string): number`

Throws if ID is invalid, with custom context message.

```typescript
const id = validateId(urlParam, "Product ID");
// Throws: "Product ID must be a positive integer, received: ..."
```

---

### **Quantity Validation**

#### 7. `isValidQuantity(quantity: unknown): quantity is number`

Validates quantity values from forms or external data.

```typescript
const formQuantity = formData.get('quantity');
if (isValidQuantity(formQuantity)) {
  setQuantity(formQuantity);
}
```

**What it checks:**

- ✅ Is a number
- ✅ Is an integer
- ✅ Is positive (> 0)
- ✅ Is finite

#### 8. `validateQuantity(quantity: unknown): number`

Throws if quantity is invalid.

```typescript
const qty = validateQuantity(formInput);
// Throws: "Quantity must be a positive integer, received: ..."
```

---

### **Provider Validation**

#### 9. `isValidProviderProps(props: unknown): props is ProviderProps`

Validates provider component props.

```typescript
if (!isValidProviderProps({ children })) {
  throw new Error('Provider received invalid props');
}
```

**What it checks:**

- ✅ Props is an object
- ✅ Has children property
- ✅ Children is valid React content

#### 10. `isValidReactChildren(children: unknown): children is React.ReactNode`

Validates React children prop.

```typescript
if (isValidReactChildren(children)) {
  // Safe to render
}
```

---

## 📝 Updated Files

### **1. `src/context/ShoppingCartContext.tsx`**

#### **Context Definition**

**Before:**

```typescript
const ShoppingCartContext = createContext({} as ShoppingCartContext);

export function useShoppingCart() {
  return useContext(ShoppingCartContext);
}
```

**After:**

```typescript
// Initialize with undefined to detect usage outside provider
const ShoppingCartContext = createContext<ShoppingCartContext | undefined>(undefined);

export function useShoppingCart(): ShoppingCartContext {
  const context = useContext(ShoppingCartContext);

  // Type guard validation - catches usage outside provider
  assertShoppingCartContext(context);

  return context; // Guaranteed to be valid
}
```

**Benefits:**

- ✅ Catches hook usage outside provider immediately
- ✅ Clear error message guides developer to fix
- ✅ No runtime crashes from undefined context
- ✅ TypeScript knows context is valid after assertion

---

#### **Provider Props Validation**

**Added at provider boundary:**

```typescript
export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
  // Validate provider props at the boundary
  if (!isValidProviderProps({ children })) {
    throw new Error('ShoppingCartProvider received invalid props');
  }
  // ... rest of implementation
}
```

---

#### **ID Validation in Context Methods**

**Before:**

```typescript
const getItemQuantity = (id: number) => {
  const item = cartItems.find(item => item.id === id);
  return item?.quantity || 0;
};
```

**After:**

```typescript
const getItemQuantity = (id: number) => {
  // Validate ID at the external boundary
  if (!isValidId(id)) {
    console.error(`Invalid ID passed to getItemQuantity: ${id}`);
    return 0;
  }

  const item = findById(cartItems, id);
  return isDefined(item) ? item.quantity : 0;
};
```

**Same pattern applied to:**

- `increaseCartQuantity(id)`
- `decreaseCartQuantity(id)`
- `removeFromCart(id)`

**Benefits:**

- ✅ Validates IDs from external sources (components, URL params)
- ✅ Prevents invalid IDs from corrupting cart state
- ✅ Clear error logging for debugging
- ✅ Graceful failure (returns early instead of crashing)

---

### **2. `src/components/StoreItem.tsx`**

**Before:**

```typescript
export function StoreItem({ id, name, price, imgUrl }: StoreItemProps) {
  // ... implementation
}
```

**After:**

```typescript
export function StoreItem(props: StoreItemProps) {
  // Validate props at the component boundary
  if (!isValidStoreItemProps(props)) {
    console.error('StoreItem received invalid props:', props);
    return null; // Don't render if props are invalid
  }

  const { id, name, price, imgUrl } = props;
  // ... rest of implementation
}
```

**Benefits:**

- ✅ Validates data from JSON imports or API
- ✅ Prevents rendering with invalid data
- ✅ Clear error logging shows exactly what's wrong
- ✅ Graceful degradation (renders nothing instead of crashing)

---

### **3. `src/components/CartItem.tsx`**

**Before:**

```typescript
export function CartItem({ id, quantity }: CartItemProps) {
  // ... implementation
}
```

**After:**

```typescript
export function CartItem(props: CartItemProps) {
  const { id, quantity } = props;

  // Validate props at the component boundary
  if (!isValidId(id)) {
    console.error('CartItem received invalid id:', id);
    return null;
  }

  if (!isValidQuantity(quantity)) {
    console.error('CartItem received invalid quantity:', quantity);
    return null;
  }

  // ... rest of implementation
}
```

**Benefits:**

- ✅ Validates cart items from localStorage
- ✅ Prevents rendering with corrupted data
- ✅ Separate validation for id and quantity provides specific errors
- ✅ Protects against localStorage corruption

---

## 📚 Examples File

Created `src/utilities/externalBoundaryExamples.tsx` with 13 comprehensive examples:

1. **Context Without Provider** - Catching common integration error
2. **Safe Context Hook** - Proper validation pattern
3. **Props Validation** - Component boundary protection
4. **Strict Props Validation** - Fail-fast pattern
5. **ID Validation** - URL params and user input
6. **Strict ID Validation** - With custom error messages
7. **Quantity Validation** - Form input validation
8. **React Children Validation** - Provider props
9. **Provider Validation** - Complete provider guard
10. **Complete Integration** - All boundaries protected
11. **Defensive Programming** - Comprehensive validation
12. **Testing Context** - Mock context for tests
13. **API Response Validation** - External API data

---

## 🎨 Usage Patterns

### **Pattern 1: Context Usage Validation**

```typescript
// Hook automatically validates
export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  assertShoppingCartContext(context);
  return context;
}

// Usage in component
function MyComponent() {
  const cart = useShoppingCart(); // ✅ Throws clear error if outside provider
  return <div>{cart.cartQuantity}</div>;
}
```

### **Pattern 2: Component Props Validation**

```typescript
export function StoreItem(props: StoreItemProps) {
  if (!isValidStoreItemProps(props)) {
    console.error('Invalid props:', props);
    return null; // Graceful failure
  }

  const { id, name, price } = props;
  return <div>{name} - ${price}</div>;
}
```

### **Pattern 3: ID Validation from External Sources**

```typescript
function handleAddToCart(itemId: unknown) {
  if (!isValidId(itemId)) {
    toast.error('Invalid item ID');
    return;
  }

  // TypeScript knows itemId is number here
  increaseCartQuantity(itemId);
}
```

### **Pattern 4: API Response Validation**

```typescript
async function fetchItems() {
  const response = await fetch('/api/items');
  const data = await response.json();

  // Validate each item
  const validItems = data.filter(isValidStoreItemProps);
  return validItems; // Safe to use
}
```

### **Pattern 5: Form Input Validation**

```typescript
function handleQuantityChange(input: string) {
  const parsed = parseInt(input);

  if (!isValidQuantity(parsed)) {
    setError('Quantity must be a positive number');
    return;
  }

  setQuantity(parsed); // Safe
}
```

---

## ✨ Benefits

### **1. Early Error Detection**

- Catches errors at integration points before they propagate
- Clear error messages point to exact problem
- Prevents cascading failures throughout app

### **2. Runtime Safety**

- Validates data from all external sources
- Protects against corrupted localStorage
- Validates JSON imports and API responses
- Guards against invalid user input

### **3. Better Error Messages**

```typescript
// Instead of: "Cannot read property 'cartItems' of undefined"
// You get: "useShoppingCart must be used within ShoppingCartProvider.
//          Make sure your component is wrapped in <ShoppingCartProvider>."
```

### **4. Development Experience**

- Errors caught immediately during development
- Clear guidance on how to fix
- No mysterious crashes in production

### **5. Type Safety at Boundaries**

```typescript
// After validation, TypeScript knows exact types
if (isValidId(input)) {
  // input is number here
  processId(input); // ✅ Type-safe
}
```

---

## 🧪 Testing

### **Test Context Outside Provider**

```typescript
// This will throw with clear error message
function BrokenComponent() {
  const cart = useShoppingCart(); // ❌ Not wrapped in provider
  return <div>{cart.cartQuantity}</div>;
}

// Error: useShoppingCart must be used within ShoppingCartProvider
```

### **Test Invalid Props**

```typescript
const invalidItem = { id: -1, name: "", price: -10, imgUrl: "" };
const result = isValidStoreItemProps(invalidItem);
// result === false, with console errors showing what's wrong
```

### **TypeScript Compilation**

✅ All changes pass TypeScript compilation (`npx tsc --noEmit`)

---

## 🚀 Best Practices

### **When to Use Each Type Guard:**

| Boundary | Use This | Example |
| ---------- | ---------- | --------- |
| Context hook | `assertShoppingCartContext()` | `const ctx = useContext(...); assertShoppingCartContext(ctx);` |
| Component props | `isValidStoreItemProps()` | `if (!isValidStoreItemProps(props)) return null;` |
| ID from URL/user | `isValidId()` | `if (isValidId(urlParam)) processId(urlParam);` |
| Form quantity | `isValidQuantity()` | `if (isValidQuantity(input)) setQuantity(input);` |
| Provider props | `isValidProviderProps()` | `if (!isValidProviderProps(props)) throw Error;` |
| API responses | `.filter(isValidStoreItemProps)` | `const valid = data.filter(isValidStoreItemProps);` |

---

## 🔒 Security Benefits

1. **Input Validation**: All external inputs validated before use
2. **Type Safety**: Prevents type confusion attacks
3. **Fail-Fast**: Invalid data caught immediately
4. **Clear Boundaries**: Explicit validation at integration points

---

## 📖 Key Concepts

### **External Boundary**

Any point where data enters your application:

- React Context (from provider to consumer)
- Component props (from parent to child)
- User input (forms, URL params)
- External APIs (fetch responses)
- Browser storage (localStorage, sessionStorage)
- JSON imports

### **Fail-Fast Principle**

Validate early, fail clearly:

```typescript
// ✅ Good: Validate at boundary
if (!isValidId(id)) {
  throw new Error('Invalid ID');
}

// ❌ Bad: Let invalid data propagate
const item = items.find(i => i.id === id); // Crashes later
```

---

## 🎯 Summary

External Boundary Type Guards implementation provides:

1. ✅ **Context Validation** - useShoppingCart throws clear error if used outside provider
2. ✅ **Props Validation** - StoreItem and CartItem validate props at boundary
3. ✅ **ID Validation** - All ID inputs validated (positive integers only)
4. ✅ **Quantity Validation** - Form inputs validated before use
5. ✅ **Provider Validation** - Provider props checked at initialization
6. ✅ **Integration Protection** - All external boundaries guarded
7. ✅ **Clear Error Messages** - Developers know exactly what's wrong and how to fix
8. ✅ **TypeScript Safety** - Type narrowing after validation
9. ✅ **Production Safety** - Graceful degradation instead of crashes
10. ✅ **13 Practical Examples** - Complete usage patterns documented

**Result:** Integration errors caught early with clear messages, preventing runtime crashes and providing better developer experience!

---

## 🔗 Related Documentation

- [Type Guard Implementation](./TYPE_GUARD_IMPLEMENTATION.md) - Optional value handling
- [TypeScript Handbook - Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [React Context Best Practices](https://react.dev/reference/react/useContext)
