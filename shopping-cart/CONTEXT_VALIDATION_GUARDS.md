# Enhanced Context Validation Type Guards

## Overview

This document details the enhanced TypeScript Type Guards for **Context Validation** - comprehensive validation of React Context structure, methods, and values to catch integration errors early and ensure type safety throughout the application.

---

## 🎯 Problem Solved

### **Common Context Integration Errors:**

```typescript
// ❌ PROBLEM 1: Using context outside provider
const { cart } = useShoppingCart(); // Used outside provider
cart.openCart(); // TypeError: Cannot read property 'openCart' of undefined

// ❌ PROBLEM 2: Invalid context value structure
<Context.Provider value={{ incomplete: 'object' }}>
  {/* Missing required methods - will crash */}
</Context.Provider>

// ❌ PROBLEM 3: Invalid property values
<Context.Provider value={{
  ...methods,
  cartQuantity: -5,  // Invalid negative quantity
  cartItems: "not an array"  // Wrong type
}}>
```

## ✅ Solution: Enhanced Context Validation

Comprehensive type guards that validate:

- ✅ Context is used within Provider
- ✅ All required methods exist
- ✅ Methods have correct signatures
- ✅ Properties have valid types and values
- ✅ cartItems array contains valid data
- ✅ cartQuantity is non-negative and finite

---

## 📦 Enhanced Type Guards Added

### **1. `isShoppingCartContext()` - Enhanced Version**

Comprehensive validation of entire context structure with detailed error messages.

```typescript
const context = useContext(ShoppingCartContext);
if (isShoppingCartContext(context)) {
  // All methods and properties validated
  context.openCart(); // ✅ Safe to use
}
```

**What it validates:**

- ✅ Context is an object (not null/undefined)
- ✅ All 6 required methods exist and are functions
- ✅ `cartQuantity` exists, is a number, non-negative, and finite
- ✅ `cartItems` exists, is an array, and contains valid CartItems
- ✅ Detailed console errors for each validation failure

**Improvements over basic version:**

- Checks each method individually with specific error messages
- Validates `cartQuantity` is non-negative and finite (not NaN/Infinity)
- Validates `cartItems` array structure using `isCartItemArray`
- Provides detailed console logging for debugging

---

### **2. `validateContextValue()` - Provider-Level Validation**

Validates context value before passing to Provider.

```typescript
const contextValue = {
  openCart, closeCart, // ... all methods
  cartQuantity, cartItems
};

if (validateContextValue(contextValue, 'ShoppingCartContext')) {
  // ✅ Safe to provide
  return <Context.Provider value={contextValue}>...</Context.Provider>
} else {
  // ❌ Invalid context
  throw new Error('Invalid context value');
}
```

**What it does:**

- ✅ Validates complete context structure
- ✅ Performs smoke tests on methods
- ✅ Ensures functions are callable
- ✅ Custom context name for error messages

---

### **3. `hasValidContextMethodSignatures()` - Method Signature Validation**

Validates that context methods have correct signatures (arity).

```typescript
if (hasValidContextMethodSignatures(context)) {
  console.log('✅ All methods have correct signatures');
  // ID methods: accept 1 parameter
  // No-arg methods: accept 0 parameters
}
```

**What it checks:**

- ✅ `openCart`, `closeCart` accept 0 parameters
- ✅ All methods are functions
- ✅ Warns if arity doesn't match expectations

---

### **4. `logContextStructure()` - Development Logging**

Logs detailed context structure for debugging (development only).

```typescript
logContextStructure(context, 'ShoppingCartContext');

// Console output:
// ShoppingCartContext Structure
//   ✅ Valid context structure
//   Methods: { openCart: "function", closeCart: "function", ... }
//   Properties: { cartQuantity: 3, cartItemsCount: 2 }
```

**What it does:**

- ✅ Shows all methods and their types
- ✅ Shows property values
- ✅ Indicates if structure is valid/invalid

---

### **5. `isContextDefaultValue()` - Default Value Detection**

Checks if context has default empty value (not provided).

```typescript
if (isContextDefaultValue(context)) {
  throw new Error('Context not provided');
}
```

**What it checks:**

- ✅ Context is undefined
- ✅ Context is null
- ✅ Context is empty object `{}`

---

## 📝 Enhanced Implementation

### **`src/context/ShoppingCartContext.tsx`**

#### **Added Comprehensive Validation**

```typescript
import {
    // ... existing imports
    validateContextValue,
    logContextStructure,
    hasValidContextMethodSignatures
} from "../utilities/typeGuards";
```

#### **Provider with useMemo and Validation**

**Before:**

```typescript
return (
  <ShoppingCartContext.Provider value={{
    openCart,
    closeCart,
    // ... rest
  }}>
    {children}
  </ShoppingCartContext.Provider>
);
```

**After:**

```typescript
// Memoize context value to prevent unnecessary re-renders
const contextValue = useMemo<ShoppingCartContextType>(() => {
  const value: ShoppingCartContextType = {
    openCart,
    closeCart,
    getItemQuantity,
    increaseCartQuantity,
    decreaseCartQuantity,
    removeFromCart,
    cartQuantity,
    cartItems
  };

  // Validate context value structure in development
  if (process.env.NODE_ENV === 'development') {
    // 1. Validate structure
    if (!validateContextValue(value, 'ShoppingCartContext')) {
      console.error('ShoppingCartProvider: Invalid context value created');
    }

    // 2. Validate method signatures
    if (!hasValidContextMethodSignatures(value)) {
      console.warn('ShoppingCartProvider: Method signatures may be incorrect');
    }

    // 3. Optional: Log context structure for debugging
    // logContextStructure(value, 'ShoppingCartContext');
  }

  return value;
}, [
  openCart,
  closeCart,
  getItemQuantity,
  increaseCartQuantity,
  decreaseCartQuantity,
  removeFromCart,
  cartQuantity,
  cartItems
]);

return (
  <ShoppingCartContext.Provider value={contextValue}>
    {children}
    <ShoppingCart isOpen={isOpen} />
  </ShoppingCartContext.Provider>
);
```

**Benefits:**

- ✅ **Performance**: `useMemo` prevents unnecessary re-renders
- ✅ **Validation**: Catches structural errors at creation time
- ✅ **Development Safety**: Validates in dev, no overhead in production
- ✅ **Debugging**: Optional logging for troubleshooting
- ✅ **Clear Dependencies**: Explicit memo dependencies list

---

## 🎨 Validation Layers

### **Layer 1: Hook Usage Validation**

Validates when consumer uses the hook:

```typescript
export function useShoppingCart(): ShoppingCartContext {
  const context = useContext(ShoppingCartContext);

  // ✅ Type guard - catches usage outside provider
  assertShoppingCartContext(context);

  return context;
}
```

**Catches:**

- Using hook outside Provider
- Provider not wrapping component
- Context value is undefined

---

### **Layer 2: Provider Creation Validation**

Validates when Provider creates context value:

```typescript
const contextValue = useMemo(() => {
  const value = { /* ... */ };

  if (process.env.NODE_ENV === 'development') {
    validateContextValue(value, 'ShoppingCartContext');
  }

  return value;
}, [dependencies]);
```

**Catches:**

- Missing methods
- Invalid property types
- Incorrect property values
- Invalid cartItems array

---

### **Layer 3: Method Signature Validation**

Validates method signatures match expected patterns:

```typescript
if (hasValidContextMethodSignatures(value)) {
  // All method signatures correct
}
```

**Catches:**

- Methods with wrong arity
- Non-function properties
- Binding issues

---

### **Layer 4: Runtime Value Validation**

Validates values during operation:

```typescript
// Enhanced isShoppingCartContext validates:
// - cartQuantity is non-negative
// - cartQuantity is finite (not NaN/Infinity)
// - cartItems contains valid CartItem objects
```

**Catches:**

- Negative quantities
- NaN or Infinity values
- Corrupted cart items
- Type mismatches

---

## 📚 Examples File

Created `src/utilities/contextValidationExamples.tsx` with 13 comprehensive examples:

1. **Context Outside Provider** - Error handling pattern
2. **Structure Validation** - Valid vs invalid structure
3. **Method Signatures** - Validating function arity
4. **Validate Before Providing** - Provider-level checks
5. **Development Logging** - Debug output pattern
6. **Detecting Default Value** - Empty context detection
7. **Safe Context Hook** - Complete hook pattern
8. **Invalid cartQuantity** - Property validation
9. **Invalid cartItems** - Array validation
10. **Complete Provider Pattern** - Full implementation
11. **Testing Context** - Unit test patterns
12. **Error Recovery** - Fallback strategies
13. **Custom Validators** - Business logic validation

---

## 🔍 Error Messages

### **Before Enhancement:**

```typescript
TypeError: Cannot read property 'openCart' of undefined
  at Component.tsx:15
```

😕 What does this mean? Where's the provider?

### **After Enhancement:**

#### **Usage Outside Provider:**

```typescript
Error: useShoppingCart must be used within ShoppingCartProvider.
Make sure your component is wrapped in <ShoppingCartProvider>.
Check the console for detailed validation errors.
  at assertShoppingCartContext (typeGuards.ts:345)
  at useShoppingCart (ShoppingCartContext.tsx:35)
```

#### **Missing Methods:**

```typescript
ShoppingCartContext: Missing required method: increaseCartQuantity
```

#### **Invalid cartQuantity:**

```typescript
ShoppingCartContext: cartQuantity must be a non-negative finite number
```

#### **Invalid cartItems:**

```typescript
ShoppingCartContext: cartItems array contains invalid items
Invalid CartItem at index 1: {"id": -1, "quantity": 0}
```

✅ Clear! Knows exactly what's wrong and where!

---

## ✨ Benefits

### **1. Early Error Detection**

```typescript
// Errors caught at Provider level in development
const contextValue = useMemo(() => {
  const value = createValue();
  validateContextValue(value); // ✅ Catches errors immediately
  return value;
}, [deps]);
```

### **2. Detailed Error Messages**

```typescript
// Each validation failure logs specific error
isShoppingCartContext(context);
// Console: "ShoppingCartContext: Missing required method: openCart"
// Console: "ShoppingCartContext: cartQuantity must be a number"
```

### **3. Development-Only Overhead**

```typescript
if (process.env.NODE_ENV === 'development') {
  validateContextValue(value); // ✅ No production cost
}
```

### **4. Performance Optimization**

```typescript
const contextValue = useMemo(() => {
  // Value only recomputed when dependencies change
  return value;
}, [deps]); // ✅ Prevents unnecessary renders
```

### **5. Comprehensive Validation**

```typescript
// Validates:
// - Structure (methods/properties exist)
// - Types (functions are functions, numbers are numbers)
// - Values (cartQuantity >= 0, cartItems valid)
// - Signatures (methods have correct arity)
```

---

## 🧪 Testing Patterns

### **Test Context Validation**

```typescript
describe('Context Validation', () => {
  it('validates complete context structure', () => {
    const validContext = createMockContext();
    expect(isShoppingCartContext(validContext)).toBe(true);
  });

  it('rejects context missing methods', () => {
    const invalidContext = { cartQuantity: 0, cartItems: [] };
    expect(isShoppingCartContext(invalidContext)).toBe(false);
  });

  it('rejects negative cartQuantity', () => {
    const invalidContext = {
      ...createMockContext(),
      cartQuantity: -5
    };
    expect(isShoppingCartContext(invalidContext)).toBe(false);
  });
});
```

### **Test Hook Throws Outside Provider**

```typescript
it('throws when used outside provider', () => {
  expect(() => {
    renderHook(() => useShoppingCart());
  }).toThrow('useShoppingCart must be used within ShoppingCartProvider');
});
```

---

## 🎯 Use Cases

### **Use Case 1: Prevent Hook Misuse**

```typescript
// Developer forgets Provider
function App() {
  return <MyComponent />; // ❌ No Provider
}

// Clear error immediately
// Error: useShoppingCart must be used within ShoppingCartProvider
```

### **Use Case 2: Catch Provider Bugs**

```typescript
// Developer creates invalid context value
<Context.Provider value={{ incomplete: 'object' }}>
  {/* ❌ Caught in development */}
</Context.Provider>

// Console: ShoppingCartProvider: Invalid context value created
// Console: ShoppingCartContext: Missing required method: openCart
```

### **Use Case 3: Debug Context Issues**

```typescript
// Enable logging in development
logContextStructure(contextValue, 'ShoppingCartContext');

// See complete structure in console
// Helps debug why context isn't working
```

### **Use Case 4: Validate Custom Logic**

```typescript
// Add business logic validation
function validateCartQuantityMatches(context: unknown): boolean {
  if (!isShoppingCartContext(context)) return false;

  const actual = context.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return context.cartQuantity === actual;
}
```

---

## 📊 Summary

Enhanced Context Validation provides:

1. ✅ **5 Additional Type Guards** - Complete validation toolkit
2. ✅ **Comprehensive Error Messages** - Detailed validation feedback
3. ✅ **Multi-Layer Validation** - Hook, Provider, Runtime, Methods
4. ✅ **Development-Only Overhead** - No production cost
5. ✅ **Performance Optimization** - useMemo prevents re-renders
6. ✅ **13 Practical Examples** - Complete usage patterns
7. ✅ **Testing Patterns** - How to test context validation
8. ✅ **Custom Validators** - Extensible validation system

### **Before vs After:**

**Before:**

- Basic context check
- Generic error messages
- Limited validation
- Unclear failures

**After:**

- Comprehensive validation
- Specific error messages
- Multi-layer checks
- Clear debugging info

---

## 🔗 Related Documentation

- [External Boundary Type Guards](./EXTERNAL_BOUNDARY_TYPE_GUARDS.md) - Initial context validation
- [Type Guards Complete Summary](./TYPE_GUARDS_COMPLETE_SUMMARY.md) - All type guards
- [React Context Best Practices](https://react.dev/reference/react/useContext)
- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

**Result:** Production-ready context validation with comprehensive error detection, detailed debugging, and zero production overhead! 🎉
