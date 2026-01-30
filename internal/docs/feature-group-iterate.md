# Feature: Group Iteration (Spec)

## Goal
Provide a schema-level way to render a `group` once per item in an array, without requiring custom HTML elements in consuming apps.

## Status
**Architecture Defined** - Ready for implementation planning.

## Summary
Introduce a new schema element that behaves like `group` but adds iteration semantics (Vue `v-for`-like).

Type name: `type: "group-iterate"`

## Motivation
- Current `group` is a structural container (like a div).
- Teams currently wrap groups with custom HTML in target apps to iterate.
- We want a Vue-first, schema-native way to render repeated group layouts.

## Non-Goals
- No framework-agnostic API.
- No automatic nested iteration in a single group (separate groups should handle nested iteration).
- No async items resolution initially (populate model first).
 
 ## Proposed Element (Schema)
 
### Baseline Shape
```javascript
{
  type: "group-iterate",
  iterate: {
    items: "cards",      // array path or function returning an array
    as: "card",          // item alias (default: "item")
    index: "i",          // index alias (default: "index")
    key: "id",           // key path or function (optional)
    scope: "item"        // "item" | "parent" (default: "item")
  },
  fields: [
    // With scope: "item" (default), use relative paths
    { type: "input", model: "title" }
    
    // With scope: "parent", use alias paths for item access
    // { type: "input", model: "card.title" }
  ]
}
```
 
 ### Required vs Optional
 - `type`: required (new element)
 - `iterate.items`: required
 - `iterate.as`: optional (default "item")
 - `iterate.index`: optional (default "index")
 - `iterate.key`: optional (see Key Behavior)
 - `iterate.scope`: optional (see Model Scope)
 - `fields`: required (same as group)
 
## Model Scope

### Implementation: Path Rewriting via Provide/Inject
Field paths are rewritten at resolution time using Vue's provide/inject pattern. Each `group-iterate` provides an iteration context (alias, array path, index), and fields inject these contexts to rewrite paths on the fly.

### Scope Behaviors

#### `scope: "item"` (default)
- The current item object is passed as the model to child fields.
- Fields use **relative paths** to access item properties: `model: "title"`, `model: "metadata.status"`
- Alias paths (e.g., `model: "card.title"`) will fail and produce a dev-mode warning.
- **Use case:** Simple iteration where only item data is needed.

#### `scope: "parent"`
- The parent model object remains the model passed to child fields.
- **Alias paths** (e.g., `model: "city.name"`) are rewritten to access the current iteration item: `cities[0].name`
- **Direct paths** (e.g., `model: "stateName"`) access parent model properties as-is.
- **Use case:** Display parent data alongside item data (e.g., showing state name in each city card).

### Path Resolution
- Only **dotted paths** are supported: `card.metadata.status` ✅
- **Bracket notation** in user paths is NOT parsed: `card.items[0]` ❌ (use `get`/`set` functions if needed)
- Paths are resolved using lodash `objGet` for nested property access.
 
 ## Items Source
 `iterate.items` can be:
 - String path (e.g. `"cards"` or `"section.cards"`)
 - Function `(rootModel, parentModel) => Array`
 
 If `iterate.items` resolves to:
 - `null`/`undefined`: render nothing
 - non-array: treat as empty and optionally warn
 
## Key Behavior
Vue list rendering requires stable keys:
- If `iterate.key` is provided:
  - **String with nested path support**: `"id"` → `objGet(item, "id")`, `"metadata.uuid"` → `objGet(item, "metadata.uuid")`
  - **Function**: `(item, index) => key` for computed keys
- If not provided:
  - Default to `index` (documented as unstable for reorderable lists)
 
## ID Collisions
Repeating a group with identical field schemas can produce duplicate DOM IDs.

### Solution: Automatic ID Prefix per Iteration
- Each `group-iterate` extends the `fieldIdPrefix` option for its children.
- Format: `{parentPrefix}-{iterationKey}-` where `iterationKey` is the resolved key or index.
- Example: A field with model `"title"` in iteration 0 becomes `"frm1-0-title"` (if parent prefix is `"frm1-"`).
- Applies to `fieldId` and all derived `aria-*` IDs automatically.
 
## Nested Iteration
`group-iterate` can be nested to handle multi-level data structures (e.g., orders with line items).

### Path Resolution Order: Innermost-First
When resolving alias paths in nested contexts, check from most specific to least specific (like JavaScript scope):

1. Does path match innermost alias? Use that context.
2. Does path match outer alias? Use that context.
3. Otherwise, use path as-is on root model.

**Example:**
```javascript
{
  type: "group-iterate",
  iterate: { items: "orders", as: "order", scope: "parent" },
  fields: [
    {
      type: "group-iterate",
      iterate: { items: "order.lineItems", as: "line", scope: "parent" },
      fields: [
        { model: "line.quantity" },    // Innermost: orders[0].lineItems[1].quantity
        { model: "order.discount" },   // Outer: orders[0].discount
        { model: "companyName" }       // Root: companyName
      ]
    }
  ]
}
```

### Alias Collision Warning
In dev mode, warn if nested contexts use the same alias name (e.g., both use `as: "item"`). While supported via innermost-first resolution, this is confusing and should be avoided.

## Slots and Events (Existing Behavior)
- All existing slots on `group` and fields should remain usable.
- Event bus behavior should remain consistent with existing fields.
 
## Practical Examples

### Example 1: Photo Gallery Editor
```javascript
// Model
{
  galleryTitle: "Summer Vacation 2026",
  photos: [
    { id: "p1", url: "beach.jpg", caption: "Sunset at the beach", rating: 5 },
    { id: "p2", url: "mountains.jpg", caption: "Mountain hike", rating: 4 },
    { id: "p3", url: "city.jpg", caption: "City lights", rating: 5 }
  ]
}

// Schema - Edit gallery with photos
{
  fields: [
    { 
      type: "input", 
      model: "galleryTitle", 
      label: "Gallery Title" 
    },
    {
      type: "group-iterate",
      iterate: { 
        items: "photos", 
        key: "id", 
        as: "photo",
        scope: "item"  // Simple - just edit photo data
      },
      styleClasses: "photo-card",
      fields: [
        { 
          type: "image", 
          model: "url", 
          label: "Photo",
          readonly: true 
        },
        { 
          type: "input", 
          model: "caption", 
          label: "Caption",
          placeholder: "Describe this photo..."
        },
        { 
          type: "radios", 
          model: "rating", 
          label: "Rating",
          values: [1, 2, 3, 4, 5]
        }
      ]
    }
  ]
}
```

### Example 2: Todo List with Categories
```javascript
// Model
{
  userName: "John Doe",
  todos: [
    { id: 1, task: "Buy groceries", done: false, priority: "high" },
    { id: 2, task: "Call dentist", done: true, priority: "medium" },
    { id: 3, task: "Finish report", done: false, priority: "high" }
  ]
}

// Schema - Show user name in each todo card
{
  fields: [
    {
      type: "group-iterate",
      iterate: { 
        items: "todos", 
        key: "id", 
        as: "todo",
        scope: "parent"  // Need parent for userName
      },
      styleClasses: "todo-item",
      fields: [
        { 
          type: "checkbox", 
          model: "todo.done", 
          label: "Complete"
        },
        { 
          type: "input", 
          model: "todo.task", 
          label: "Task"
        },
        { 
          type: "select", 
          model: "todo.priority", 
          label: "Priority",
          values: ["low", "medium", "high"]
        },
        { 
          type: "content",
          content: `<small>Assigned to: ${model.userName}</small>`
        }
      ]
    }
  ]
}
```

### Example 3: Simple Product List
```javascript
// Model
{
  products: [
    { id: "prod1", name: "Laptop", price: 999, quantity: 1 },
    { id: "prod2", name: "Mouse", price: 25, quantity: 2 },
    { id: "prod3", name: "Keyboard", price: 75, quantity: 1 }
  ]
}

// Schema - Pure item editing
{
  fields: [
    {
      type: "group-iterate",
      iterate: { 
        items: "products", 
        key: "id"
        // Default: as: "item", scope: "item"
      },
      fields: [
        { 
          type: "input", 
          model: "name", 
          label: "Product Name",
          readonly: true
        },
        { 
          type: "input", 
          inputType: "number",
          model: "price", 
          label: "Price ($)"
        },
        { 
          type: "input", 
          inputType: "number",
          model: "quantity", 
          label: "Quantity",
          min: 1
        },
        {
          type: "content",
          get: (model) => {
            const total = model.price * model.quantity;
            return `<strong>Total: $${total}</strong>`;
          }
        }
      ]
    }
  ]
}
```

### Example 4: Nested - Orders with Line Items
```javascript
// Model
{
  companyName: "Acme Corp",
  orders: [
    {
      id: "ord1",
      customerName: "Alice Smith",
      discount: 0.1,
      lineItems: [
        { sku: "A100", productName: "Widget", quantity: 5, price: 10 },
        { sku: "B200", productName: "Gadget", quantity: 2, price: 25 }
      ]
    },
    {
      id: "ord2",
      customerName: "Bob Jones",
      discount: 0.05,
      lineItems: [
        { sku: "C300", productName: "Doohickey", quantity: 1, price: 100 }
      ]
    }
  ]
}

// Schema - Nested iteration with parent context access
{
  fields: [
    {
      type: "group-iterate",
      iterate: { 
        items: "orders", 
        key: "id", 
        as: "order",
        scope: "parent"
      },
      styleClasses: "order-card",
      legend: "Orders",
      fields: [
        { 
          type: "content",
          content: `<h3>Order for ${model.companyName}</h3>`
        },
        { 
          type: "input", 
          model: "order.customerName", 
          label: "Customer"
        },
        { 
          type: "input",
          inputType: "number",
          model: "order.discount", 
          label: "Discount (%)",
          min: 0,
          max: 1,
          step: 0.01
        },
        {
          type: "group-iterate",
          iterate: { 
            items: "order.lineItems",  // Nested path
            key: "sku", 
            as: "line",
            scope: "parent"
          },
          styleClasses: "line-item",
          legend: "Line Items",
          fields: [
            { 
              type: "input", 
              model: "line.productName", 
              label: "Product"
            },
            { 
              type: "input",
              inputType: "number",
              model: "line.quantity", 
              label: "Qty"
            },
            { 
              type: "input",
              inputType: "number",
              model: "line.price", 
              label: "Price"
            },
            {
              type: "content",
              get: (model, schema, ctx) => {
                // Access line item via alias
                const lineTotal = ctx.line.quantity * ctx.line.price;
                // Access order discount from outer context
                const afterDiscount = lineTotal * (1 - ctx.order.discount);
                return `<small>Subtotal: $${lineTotal} | After discount: $${afterDiscount.toFixed(2)}</small>`;
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Example 5: Dynamic Items (Function)
```javascript
// Model
{
  showCompleted: false,
  allTasks: [
    { id: 1, title: "Task 1", completed: false },
    { id: 2, title: "Task 2", completed: true },
    { id: 3, title: "Task 3", completed: false }
  ]
}

// Schema - Filter items dynamically
{
  fields: [
    { 
      type: "checkbox", 
      model: "showCompleted", 
      label: "Show Completed Tasks" 
    },
    {
      type: "group-iterate",
      iterate: { 
        items: (model) => {
          // Function is called with model
          return model.showCompleted 
            ? model.allTasks 
            : model.allTasks.filter(t => !t.completed);
        },
        key: "id"
      },
      fields: [
        { type: "input", model: "title", label: "Task" },
        { type: "checkbox", model: "completed", label: "Done" }
      ]
    }
  ]
}
```

### Example 6: State Selector with Cities
```javascript
// Model
{
  selectedState: {
    name: "California",
    code: "CA",
    taxRate: 0.0725
  },
  cities: [
    { id: 1, name: "Los Angeles", population: 4000000 },
    { id: 2, name: "San Diego", population: 1400000 },
    { id: 3, name: "San Francisco", population: 870000 }
  ]
}

// Schema - Show state info in each city
{
  fields: [
    {
      type: "group-iterate",
      iterate: { 
        items: "cities", 
        key: "id", 
        as: "city",
        scope: "parent"  // Keep parent model for selectedState
      },
      styleClasses: "city-card",
      fields: [
        {
          type: "content",
          content: `<div class="state-badge">
            ${model.selectedState.name} (${model.selectedState.code})
          </div>`
        },
        { 
          type: "input", 
          model: "city.name", 
          label: "City Name"
        },
        { 
          type: "input",
          inputType: "number",
          model: "city.population", 
          label: "Population"
        },
        {
          type: "content",
          get: (model) => {
            // Access both parent (selectedState) and item (city via alias rewriting)
            return `<small>Tax Rate: ${(model.selectedState.taxRate * 100).toFixed(2)}%</small>`;
          }
        }
      ]
    }
  ]
}
```
 
## Implementation Challenges

### Validation with Dynamic Fields
- When items array changes length, field registration count must update dynamically.
- Solution: `group-iterate` emits field count changes; form generator adjusts counter.
- **Limitation:** Validation state resets when items array mutates (reorder/add/remove).

### Error Tracking for Iterated Fields
- Error UIDs must include iteration context to identify which item has errors.
- Error display should show item identifier (key/index) for clarity.

### Performance Considerations
- Large arrays (100+ items) may impact render performance.
- Recommend: Use virtual scrolling or pagination at app level for large datasets.
- Each iteration creates new Vue component instances.

## Known Limitations
- ❌ **Async items resolution:** Not supported. Populate model before rendering.
- ❌ **Validation persistence:** Validation state resets if items array changes.
- ❌ **Parent access in scope: "item":** Fields can only access item data (use `scope: "parent"` for mixed access).
- ❌ **Bracket notation in paths:** User paths with `[index]` are not parsed (use dotted paths only).
- ⚠️ **Deep nesting:** While supported, deeply nested iterations (3+ levels) may be difficult to debug.

## Resolved Decisions
- ✅ **Name:** `type: "group-iterate"`
- ✅ **Async items:** Not supported initially
- ✅ **Parent + item access:** Via `scope: "parent"` with alias paths
- ✅ **Key paths:** Support nested paths via `objGet`
- ✅ **ID suffix:** Always auto-generated from key or index
- ✅ **Implementation:** Provide/inject for path rewriting (not schema cloning)
- ✅ **Nested resolution:** Innermost-first (like JavaScript scope)

## Implementation Overview

### New Component: `formGroupIterate.vue`
- Handles v-for iteration over items array
- Resolves `iterate.items` (string path or function)
- Provides `iterationContext` via Vue provide/inject
- Passes appropriate model based on `scope` setting
- Extends `fieldIdPrefix` for child fields
- Handles key generation from `iterate.key`

### Modified Component: `abstractField.js`
- Injects `iterationContexts` array (supports nesting)
- Updates `value` getter/setter to rewrite paths:
  - Check injected contexts from innermost to outermost
  - If path matches alias, rewrite to array access path
  - Otherwise, use path as-is
- Dev mode: Warn if alias path used with `scope: "item"`

### Modified Component: `formGroup.vue`
- Add template case for `field.type === 'group-iterate'`
- Render `formGroupIterate` component

### Estimated Complexity
- **Lines of code:** ~500-800 new/modified lines
- **Risk level:** Medium-High (touches core field resolution)
- **Testing needs:** Comprehensive (nested scenarios, edge cases, validation)

## TDD Implementation Plan

This feature can be built incrementally using Test-Driven Development. Each increment is independently testable and shippable.

### Increment 1: Items Resolution
**Goal:** Resolve `iterate.items` to an array

**Tests:**
- Resolve string path to array
- Resolve nested path (e.g., `"data.cards"`)
- Call function with model arguments
- Return empty array for null/undefined
- Warn in dev mode for non-array values

**Implementation:** Utility function in `utils/schema.js`

**Shippable:** ✅ Yes (internal utility, no breaking changes)

---

### Increment 2: Key Generation
**Goal:** Generate Vue keys for v-for iterations

**Tests:**
- Use string key path with `objGet`
- Use nested key path (e.g., `"metadata.uuid"`)
- Call function key with item and index
- Default to index when no key provided

**Implementation:** Utility function in `utils/schema.js`

**Shippable:** ✅ Yes (internal utility)

---

### Increment 3: Basic Iteration Rendering
**Goal:** Render formGroup for each item with `scope: "item"`

**Tests:**
- Render nothing for empty items array
- Render one group per item
- Pass item as model when `scope: "item"`
- Pass parent as model when `scope: "parent"`
- Use generated keys for v-for
- Handle items array reactivity

**Implementation:** Basic `formGroupIterate.vue` component

**Shippable:** ✅ Yes! Basic iteration works for `scope: "item"` with relative paths

**Usage at this stage:**
```javascript
{
  type: "group-iterate",
  iterate: { items: "todos", key: "id" },
  fields: [
    { type: "input", model: "title" }  // Relative path only
  ]
}
```

---

### Increment 4: ID Prefix Extension
**Goal:** Make field IDs unique per iteration

**Tests:**
- Extend `fieldIdPrefix` for children with key
- Extend `fieldIdPrefix` with index when no key
- Integration test: verify unique DOM IDs in rendered form
- Verify aria-* IDs are also unique

**Implementation:** ID prefix logic in `formGroupIterate.vue`

**Shippable:** ✅ Yes! Prevents DOM ID collisions

---

### Increment 5: Path Rewriting (Single Level)
**Goal:** Rewrite alias paths for `scope: "parent"`

**Tests:**
- No rewriting when no iteration context
- Rewrite alias path with single context (`"card.title"` → `"cards[0].title"`)
- Don't rewrite non-alias paths
- Warn in dev mode if alias used with `scope: "item"`
- Handle fields with no model property
- Custom `get` functions bypass rewriting

**Implementation:** 
- Add inject to `abstractField.js`
- Update `value` getter/setter with path rewriting logic

**Shippable:** ✅ Yes! Now `scope: "parent"` works with alias paths

**Usage at this stage:**
```javascript
{
  type: "group-iterate",
  iterate: { items: "cities", as: "city", scope: "parent" },
  fields: [
    { type: "input", model: "stateName" },   // Parent data
    { type: "input", model: "city.name" }    // Item data via alias
  ]
}
```

---

### Increment 6: Nested Iteration
**Goal:** Support nested group-iterate with innermost-first resolution

**Tests:**
- Resolve innermost alias first in nested contexts
- Resolve outer alias when inner doesn't match
- Use root model when no alias matches
- Warn about duplicate aliases in dev mode
- Test 3-level nesting

**Implementation:**
- Array-based context injection in `formGroupIterate.vue`
- Multi-context loop in `abstractField.js` path rewriting

**Shippable:** ✅ Yes! Nested iteration fully functional

**Usage at this stage:**
```javascript
{
  type: "group-iterate",
  iterate: { items: "orders", as: "order", scope: "parent" },
  fields: [
    {
      type: "group-iterate",
      iterate: { items: "order.lineItems", as: "line", scope: "parent" },
      fields: [
        { model: "line.quantity" },
        { model: "order.discount" }
      ]
    }
  ]
}
```

---

### Increment 7: FormGroup Integration
**Goal:** Connect group-iterate to existing form generator

**Tests:**
- Render `group-iterate` when `type === 'group-iterate'`
- Pass all props (model, options, errors, eventBus) correctly
- Integration test: full form with group-iterate renders
- Slots work correctly
- Mix group-iterate with regular fields

**Implementation:**
- Add template case in `formGroup.vue`
- Register `formGroupIterate` component

**Shippable:** ✅ Yes! Feature is now usable in production forms

---

### Increment 8: Validation Support
**Goal:** Handle validation with dynamic field counts

**Tests:**
- Register fields with event bus
- Validate all iterated fields
- Collect errors from all iterations
- Clear validation when items array changes
- Handle field count updates on array mutation
- Error UIDs include iteration context

**Implementation:**
- Field registration/deregistration handling in `formGroupIterate.vue`
- Watch items array for length changes
- Extend error UID generation

**Shippable:** ✅ Yes! Full validation support

---

### Increment 9: Error Display Enhancement (Optional)
**Goal:** Make errors easier to understand

**Tests:**
- Error messages include item identifier
- Error summary groups by iteration
- Clicking error focuses correct iterated field

**Implementation:**
- Enhance error objects with iteration metadata
- Update error display components

**Shippable:** ✅ Yes (nice-to-have improvement)

---

## Implementation Summary

| # | Feature | Lines | Risk | Dependencies |
|---|---------|-------|------|--------------|
| 1 | Items resolution | ~50 | Low | None |
| 2 | Key generation | ~30 | Low | #1 |
| 3 | Basic iteration | ~150 | Medium | #1, #2 |
| 4 | Unique IDs | ~40 | Low | #3 |
| 5 | Path rewriting | ~80 | Medium | None |
| 6 | Nested iteration | ~50 | Medium | #5 |
| 7 | FormGroup integration | ~30 | Low | #3-6 |
| 8 | Validation | ~100 | High | #7 |
| 9 | Error display | ~80 | Low | #8 |

**Total estimated: ~610 lines across 9 increments**

### Development Timeline
- Each increment: 2-4 hours (includes tests + implementation)
- Total: 18-36 hours of focused development
- Can be split across multiple sessions
- Each increment can be committed and reviewed independently

### Testing Strategy
- **Unit tests:** Each utility function and component method
- **Component tests:** Rendering and prop handling
- **Integration tests:** Full form with group-iterate
- **Regression tests:** Run all existing tests (must pass)
- **Manual tests:** Example forms in dev environment

## Next Steps
1. Set up test environment for new component
2. Begin Increment 1 (write tests first)
3. Implement until tests pass
4. Ship increment and move to next
5. After Increment 3: demo basic feature to stakeholders
6. After Increment 7: ready for beta testing
7. After Increment 8: ready for production
 
