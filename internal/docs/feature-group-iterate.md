# Feature: Field Iteration (Spec)

## Goal
Provide a schema-level way to render **any field type** multiple times (once per item in an array), without requiring custom HTML elements in consuming apps.

## Status
**Implemented in v3.2.x** - Universal iteration property for all field types.

## Summary
Introduce an `iterate` property that can be added to **any field type** to render it once per item in an array. This provides Vue `v-for`-like semantics at the schema level.

Property name: `iterate` (universal modifier, not a new type)

## Motivation
- Current approach requires custom HTML wrappers in consuming apps to iterate over fields.
- We want a Vue-first, schema-native way to render repeated field layouts.
- Iteration should be a **universal capability**, not tied to a specific field type.
- Simpler mental model: "Any field can iterate" vs "Use this special field type for iteration".

## Non-Goals
- No framework-agnostic API.
- No async items resolution initially (populate model first).
- No automatic flattening of nested iterations (use nested schemas).
 
## Design Philosophy

### Universal Iteration
The `iterate` property is a **field modifier**, not a field type. It works with:
- ✅ `type: "group"` - Render multiple groups (most common use case)
- ✅ `type: "input"` - Render multiple inputs (e.g., phone numbers)
- ✅ `type: "select"` - Render multiple selects
- ✅ `type: "textarea"` - Render multiple textareas
- ✅ **Any custom field type** - Iteration works universally

### Unified Code Path
Internally, ALL fields use the same iteration logic:
- **With `iterate`**: Render once per item in the array
- **Without `iterate`**: Render once (treated as array of 1)

This simplifies implementation and ensures consistency.

## API Design
 
### Baseline Shape (Group Iteration - Most Common)
```javascript
{
  type: "group",  // Regular group type
  iterate: {      // Iteration modifier
    items: "cards",  // array path or function returning an array
    key: "id"        // key path for unique keys (optional)
  },
  styleClasses: "card-styling",  // Applied to EACH iterated group
  fields: [
    { type: "input", model: "title" },
    { type: "input", model: "caption" }
  ]
}
```

### Simple Field Iteration (Input Example)
```javascript
{
  type: "input",
  inputType: "tel",
  label: "Phone Number",
  iterate: {
    items: "phoneNumbers",  // Array of strings or objects
    key: "id"
  }
}
```

### Required vs Optional
- `iterate.items`: **required** - Path to array or function returning array
- `iterate.key`: **optional** - Property name for unique keys (defaults to index)
- All other field properties work normally (`styleClasses`, `visible`, `validator`, etc.)

### Clean DOM Output
Because `iterate` is implemented inline (not as a separate component), there are **no extra wrapper elements**:

```html
<!-- Clean output with iterate -->
<fieldset class="field-group">
  <fieldset class="card">...</fieldset>  ← Item 1
  <fieldset class="card">...</fieldset>  ← Item 2
  <fieldset class="card">...</fieldset>  ← Item 3
</fieldset>
```

No wrapper `<div>` or other cruft!
 
## Model Scope

When a field has `iterate`, each iteration item becomes the model object passed to that field instance.

### For Groups (Most Common)
Child fields use **relative paths** to access item properties:

```javascript
// Model structure
{
  photos: [
    { id: 1, title: "Beach", url: "beach.jpg" },
    { id: 2, title: "Mountain", url: "mountain.jpg" }
  ]
}

// Schema - child fields get each photo as their model
{
  type: "group",
  iterate: { items: "photos", key: "id" },
  fields: [
    { type: "input", model: "title" },  // ← Accesses photo.title
    { type: "input", model: "url" }      // ← Accesses photo.url
  ]
}
```

### For Simple Fields
The field's `model` path applies to each item:

```javascript
// Model structure
{
  contacts: [
    { id: 1, phone: "555-1234" },
    { id: 2, phone: "555-5678" }
  ]
}

// Schema - input renders once per contact
{
  type: "input",
  inputType: "tel",
  model: "phone",  // ← Accesses contact.phone for each iteration
  iterate: { items: "contacts", key: "id" }
}
```

**Path Resolution:** Uses standard lodash `objGet` for nested property access with dotted notation.

## DOM Structure and Styling

### Clean DOM Output
Because `iterate` is implemented inline (not as a separate component), there are **no extra wrapper elements**:
- Each iteration renders the field directly (input, select, fieldset, etc.)
- `styleClasses` on the field applies to each iterated instance
- No container/wrapper element is created

```javascript
// This schema:
{
  type: "group",
  iterate: { items: "todos", key: "id" },
  styleClasses: "todo-card",
  fields: [{ type: "input", model: "title" }]
}

// Renders as (simplified):
<fieldset class="field-group todo-card">...</fieldset>  <!-- Item 1 -->
<fieldset class="field-group todo-card">...</fieldset>  <!-- Item 2 -->
<fieldset class="field-group todo-card">...</fieldset>  <!-- Item 3 -->
```

### Container Pattern
If you need a wrapper container (e.g., for flexbox/grid layout), wrap the iterated field in a regular group:

```javascript
{
  type: "group",
  styleClasses: "flex gap-4",  // Container styling
  fields: [
    {
      type: "group",
      iterate: { items: "todos" },
      styleClasses: "todo-card",  // Item styling
      fields: [...]
    }
  ]
}

// Renders as:
<fieldset class="field-group flex gap-4">              <!-- Container -->
  <fieldset class="field-group todo-card">...</fieldset>  <!-- Item 1 -->
  <fieldset class="field-group todo-card">...</fieldset>  <!-- Item 2 -->
</fieldset>
```

### Styling Best Practices
- **Item styling:** Use `styleClasses` on the iterated field
- **Container styling:** Use an outer `type: "group"` with `styleClasses`
- **Tailwind/utility CSS:** Works perfectly with this approach
- **Conditional item styling:** Use functions for `styleClasses` (see examples below)
 
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

## Per-Item Visibility

**Important:** When `visible` is used on a field with `iterate`, it's evaluated **per-item** (not once for all items).

### Per-Item Visibility Pattern
```javascript
{
  type: "group",
  iterate: { items: "tasks" },
  visible: (item) => item.isActive,  // ← Receives EACH item
  fields: [
    { type: "input", model: "title" }
  ]
}
```

**Behavior:**
- The `visible` function is called **once per item**
- Receives the **item model** (not root model)
- Only items where `visible` returns `true` are rendered

### Control Entire Collection Visibility
To show/hide the entire iterated group (all items at once), **wrap in an outer group**:

```javascript
{
  type: "group",
  visible: (model) => model.showTasks,  // ← Controls entire collection (root model)
  fields: [
    {
      type: "group",
      iterate: { items: "tasks" },
      visible: (item) => item.isActive,  // ← Per-item filter (item model)
      fields: [...]
    }
  ]
}
```

### Examples

**Show only active items:**
```javascript
{
  type: "group",
  iterate: { items: "users" },
  visible: (item) => item.status === "active",
  fields: [...]
}
```

**Complex visibility logic:**
```javascript
{
  type: "group",
  iterate: { items: "tasks" },
  visible: (item) => {
    // Show if high priority OR completed
    return item.priority === "high" || item.completed;
  },
  fields: [...]
}
```

**Alternative: Filter in `items` function:**
```javascript
{
  type: "group",
  iterate: {
    items: (model) => model.tasks.filter(t => t.isActive)
  },
  fields: [...]
}
```

**When to use which:**
- Use `visible` function: When visibility logic is simple and item-focused
- Use `items` filter: When you need complex filtering or root model access
- Use both: For maximum control (filter list, then conditionally show/hide items)
 
## ID Collisions
Repeating a field with identical configurations can produce duplicate DOM IDs.

### Solution: Automatic ID Prefix per Iteration
- Each iterated field extends the `fieldIdPrefix` option for its children.
- Format: `{parentPrefix}-{iterationKey}-` where `iterationKey` is the resolved key or index.
- Example: A field with model `"title"` in iteration 0 becomes `"frm1-0-title"` (if parent prefix is `"frm1-"`).
- Applies to `fieldId` and all derived `aria-*` IDs automatically.
 
## Nested Iteration
Fields with `iterate` can be nested to handle multi-level data structures. Each level receives its iteration item as the model, so paths are always relative to the current item.

**Important:** In nested iterations:
- The `items` path in inner iterations is resolved against the current iteration item (not the root model)
- All field paths are relative to the current iteration level
- Each nesting level operates independently with its own item context

**Example:**
```javascript
// Model
{
  orders: [
    {
      id: "ord1",
      customer: "Alice",
      lineItems: [
        { sku: "A100", quantity: 5, price: 10 },
        { sku: "B200", quantity: 2, price: 25 }
      ]
    }
  ]
}

// Schema - nested iteration
{
  type: "group",
  iterate: { items: "orders", key: "id" },  // Root level: iterates model.orders
  fields: [
    { type: "input", model: "customer" },  // Reads from current order
    {
      type: "group",
      iterate: { items: "lineItems", key: "sku" },  // Nested: iterates currentOrder.lineItems
      fields: [
        { type: "input", model: "quantity" },  // Reads from current lineItem
        { type: "input", model: "price" }      // Reads from current lineItem
      ]
    }
  ]
}
```

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
      type: "group",  // Wrapper group for container
      styleClasses: "photo-gallery-container",
      fields: [
        {
          type: "group",
          iterate: { 
            items: "photos", 
            key: "id"
          },
          styleClasses: "photo-card",  // Applied to EACH item
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
    ]
  ]
}
```

### Example 2: Simple Todo List
```javascript
// Model
{
  todos: [
    { id: 1, task: "Buy groceries", done: false, priority: "high" },
    { id: 2, task: "Call dentist", done: true, priority: "medium" }
  ]
}

// Schema - Edit todos
{
  fields: [
    {
      type: "group",
      styleClasses: "todo-list-container",
      fields: [
        {
          type: "group",
          iterate: { items: "todos", key: "id" },
          styleClasses: "todo-item",  // Applied to EACH todo
          fields: [
        {
          type: "checkbox",
          model: "done",
          label: "Complete"
        },
        {
          type: "input",
          model: "task",
          label: "Task"
        },
        {
          type: "select",
          model: "priority",
          label: "Priority",
          values: ["low", "medium", "high"]
        }
      ]
    }
        ]
      }
    ]
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
      type: "group",
      styleClasses: "product-list-container",
      fields: [
        {
          type: "group",
          iterate: { 
            items: "products", 
            key: "id"
          },
          styleClasses: "product-item",
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
    ]
  ]
}
```

### Example 4: Nested - Orders with Line Items
```javascript
// Model
{
  orders: [
    {
      id: "ord1",
      customerName: "Alice Smith",
      lineItems: [
        { sku: "A100", productName: "Widget", quantity: 5, price: 10 },
        { sku: "B200", productName: "Gadget", quantity: 2, price: 25 }
      ]
    }
  ]
}

// Schema - Nested iteration
{
  fields: [
    {
      type: "group",
      styleClasses: "orders-container",
      fields: [
        {
          type: "group",
          iterate: { items: "orders", key: "id" },
          styleClasses: "order-card",  // Applied to EACH order
          legend: "Orders",
          fields: [
        {
          type: "input",
          model: "customerName",
          label: "Customer"
        },
        {
          type: "group",
          iterate: { items: "lineItems", key: "sku" },
          styleClasses: "line-item",  // Applied to EACH line item
          legend: "Line Items",
          fields: [
            {
              type: "input",
              model: "productName",
              label: "Product"
            },
            {
              type: "input",
              inputType: "number",
              model: "quantity",
              label: "Qty"
            },
            {
              type: "input",
              inputType: "number",
              model: "price",
              label: "Price"
            },
            {
              type: "content",
              get: (model) => {
                const total = model.quantity * model.price;
                return `<small>Subtotal: $${total}</small>`;
              }
            }
          ]
        }
      ]
    }
        ]
      }
    ]
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
      type: "group",
      styleClasses: "tasks-container",
      fields: [
        {
          type: "group",
          iterate: { 
            items: (model) => {
              // Function is called with model
              return model.showCompleted 
                ? model.allTasks 
                : model.allTasks.filter(t => !t.completed);
            },
            key: "id"
          },
          styleClasses: "task-item",
          fields: [
        { type: "input", model: "title", label: "Task" },
        { type: "checkbox", model: "completed", label: "Done" }
      ]
    }
        ]
      }
    ]
  ]
}
```

### Example 6: Conditional Item Styling
```javascript
// Model
{
  tasks: [
    { id: 1, title: "Buy groceries", priority: "high", completed: false },
    { id: 2, title: "Call dentist", priority: "medium", completed: true },
    { id: 3, title: "Read book", priority: "low", completed: false }
  ]
}

// Schema - Dynamic styling per item
{
  fields: [
    {
      type: "group",
      styleClasses: "tasks-container",
      fields: [
        {
          type: "group",
          iterate: { items: "tasks", key: "id" },
          // styleClasses can be a function for conditional styling
          styleClasses: (item) => {
        let classes = "p-4 border rounded";
        if (item.completed) {
          classes += " bg-green-50 border-green-200";
        } else if (item.priority === "high") {
          classes += " bg-red-50 border-red-200";
        } else if (item.priority === "medium") {
          classes += " bg-yellow-50 border-yellow-200";
        } else {
          classes += " bg-gray-50 border-gray-200";
        }
        return classes;
      },
      fields: [
        { type: "checkbox", model: "completed", label: "Done" },
        { type: "input", model: "title", label: "Task" },
        { 
          type: "select", 
          model: "priority", 
          label: "Priority",
          values: ["low", "medium", "high"]
        }
      ]
    }
        ]
      }
    ]
  ]
}
```

### Example 7: Accessing Parent Data (Workaround)
```javascript
// Model
{
  projectName: "Website Redesign",
  assignedTo: "John Doe",
  tasks: [
    { id: 1, title: "Design mockups", completed: false },
    { id: 2, title: "Write copy", completed: false }
  ]
}

// Schema - Show parent data using custom getter
{
  fields: [
    {
      type: "group-iterate",
      iterate: { items: "tasks", key: "id" },
      fields: [
        {
          type: "checkbox",
          model: "completed",
          label: "Done"
        },
        {
          type: "input",
          model: "title",
          label: "Task"
        },
        {
          type: "content",
          // Workaround: Access parent model via component hierarchy
          get: function(itemModel, schema, context) {
            // The parent formGenerator still has access to root model
            // Access via this.$parent or passed context
            const rootModel = this.model || context?.model;
            if (rootModel && rootModel.projectName) {
              return `<small>Project: ${rootModel.projectName} | Assigned to: ${rootModel.assignedTo}</small>`;
            }
            return '';
          }
        }
      ]
    }
  ]
}

// Note: This workaround has limitations and may not work in all contexts.
// For robust parent+item access, use the Parent Scope Access enhancement when available.
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
- ❌ **Parent data access:** Cannot directly access parent model data from within iterated fields. Use custom `get`/`set` functions as a workaround, or wait for the Parent Scope Access enhancement (see Future Enhancements).
- ❌ **Bracket notation in paths:** User paths with `[index]` are not parsed (use dotted paths only).
- ⚠️ **Deep nesting:** While supported, deeply nested iterations (3+ levels) may be difficult to debug.

## Resolved Decisions
- ✅ **Design:** `iterate` property (universal modifier), not a new field type
- ✅ **Scope:** Item becomes model, child paths are relative
- ✅ **Async items:** Not supported initially
- ✅ **Key paths:** Support nested paths via `objGet`
- ✅ **ID suffix:** Always auto-generated from key or index
- ✅ **Implementation:** Inline iteration in `formGroup.vue` (no separate component, no extra wrapper)

## Implementation Overview

### Modified Component: `formGroup.vue`
- Add iteration logic inline (no separate component)
- Check for `field.iterate` property on any field type
- Use `<template v-for>` to iterate without wrapper element
- Resolves `iterate.items` (string path or function)
- Passes each iteration item as the model to the field
- Extends `fieldIdPrefix` for child fields
- Handles key generation from `iterate.key`
- Evaluates `styleClasses` function per-item for conditional styling
- **Universal:** Works with groups, inputs, selects, any field type

### Utility Functions: `utils/iteration.js`
- `resolveIterationItems(items, model, options)` - Resolve items path/function
- `generateIterationKey(item, index, key)` - Generate Vue keys for v-for

### Estimated Complexity
- **Lines of code:** ~200-300 new/modified lines
- **Risk level:** Medium (touches core rendering, but simpler than separate component)
- **Testing needs:** Comprehensive (nested scenarios, multiple field types, edge cases, validation)

## Universal Iteration Examples

Since `iterate` works with **any field type**, not just groups, here are examples showing different use cases:

### Iterate Simple Input Fields
```javascript
// Multiple phone numbers
{
  type: "input",
  inputType: "tel",
  label: "Phone Number",
  model: "phone",
  iterate: {
    items: "phoneNumbers",  // Array of objects: [{ id: 1, phone: "555-1234" }]
    key: "id"
  }
}
```

### Iterate Select Fields
```javascript
// Multiple address types
{
  type: "select",
  label: "Address Type",
  model: "type",
  values: ["home", "work", "other"],
  iterate: {
    items: "addresses",
    key: "id"
  }
}
```

### Iterate Complex Groups
```javascript
// Multiple complete address forms
{
  type: "group",
  styleClasses: "address-card",
  iterate: {
    items: "addresses",
    key: "id"
  },
  fields: [
    { type: "input", model: "street", label: "Street" },
    { type: "input", model: "city", label: "City" },
    { type: "input", model: "zip", label: "ZIP Code" }
  ]
}
```

### Iterate with Conditional Styling
```javascript
// Priority-based styling
{
  type: "group",
  styleClasses: (item) => {
    return item.priority === "high" ? "bg-red-50 border-red-300" : "bg-white";
  },
  iterate: {
    items: "tasks",
    key: "id"
  },
  fields: [
    { type: "input", model: "title" },
    { type: "select", model: "priority", values: ["low", "high"] }
  ]
}
```

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
**Goal:** Inline iteration in `formGroup.vue` for any field type

**Tests:**
- Render nothing for empty items array
- Render one instance per item (groups, inputs, any field type)
- Pass item as model to each instance
- Use generated keys for v-for
- No extra wrapper elements in DOM
- Handle items array reactivity

**Implementation:** Inline iteration in `formGroup.vue`

**Shippable:** ✅ Yes! Basic iteration works with relative paths

**Usage at this stage:**
```javascript
{
  type: "group",
  iterate: { items: "todos", key: "id" },
  fields: [
    { type: "input", model: "title" }  // Relative path only
  ]
}

// Also works with simple fields:
{
  type: "input",
  iterate: { items: "phoneNumbers", key: "id" },
  model: "phone"
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

**Implementation:** ID prefix logic in inline iteration

**Shippable:** ✅ Yes! Prevents DOM ID collisions

---

### Increment 5: Nested Iteration
**Goal:** Support nested iterations with simple model passing

**Tests:**
- Each iteration level receives its item as the model
- Paths are relative to current iteration level
- Test 3-level nesting
- Verify works with any field type at any level
- Verify models are passed correctly through nesting

**Implementation:**
- Pass iteration item as model to child fields
- No complex context resolution needed

**Shippable:** ✅ Yes! Nested iteration works

**Usage at this stage:**
```javascript
{
  type: "group",
  iterate: { items: "orders" },
  fields: [
    { type: "input", model: "customerName" },
    {
      type: "group",
      iterate: { items: "lineItems" },
      fields: [
        { type: "input", model: "quantity" },
        { type: "input", model: "price" }
      ]
    }
  ]
}
```

---

### Increment 6: Universal Field Type Support
**Goal:** Ensure iteration works with all field types

**Tests:**
- Iterate input fields
- Iterate select fields
- Iterate textarea fields
- Iterate custom field types
- Mix iterated and non-iterated fields

**Implementation:**
- Ensure iteration logic wraps ALL field type rendering paths
- Test with various field types

**Shippable:** ✅ Yes! Feature is now universally applicable

---

### Increment 7: Validation Support
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

### Increment 8: Error Display Enhancement (Optional)
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
| 5 | Nested iteration | ~30 | Low | #3 |
| 6 | FormGroup integration | ~30 | Low | #3-5 |
| 7 | Validation | ~100 | High | #6 |
| 8 | Error display | ~80 | Low | #7 |

**Total estimated: ~510 lines across 8 increments**

### Development Timeline
- Each increment: 2-4 hours (includes tests + implementation)
- Total: 16-32 hours of focused development
- Can be split across multiple sessions
- Each increment can be committed and reviewed independently

### Testing Strategy
- **Unit tests:** Each utility function and component method
- **Component tests:** Rendering and prop handling
- **Integration tests:** Full form with group-iterate
- **Regression tests:** Run all existing tests (must pass)
- **Manual tests:** Example forms in dev environment

## Future Enhancements

The following advanced features were considered but deferred to keep the initial implementation focused and reduce risk:

### Parent Scope Access
**Goal:** Allow fields to access both parent model data and iterated item data simultaneously.

**Proposed API:**
```javascript
{
  type: "group-iterate",
  iterate: {
    items: "cities",
    as: "city",        // alias for item
    scope: "parent"    // access parent + item data
  },
  fields: [
    { model: "stateName" },     // parent data
    { model: "city.name" }      // item data via alias
  ]
}
```

**Implementation:** Would require path rewriting via Vue provide/inject pattern in `abstractField.js`.

**Use Cases:**
- Showing parent context alongside item data (e.g., state name in each city card)
- Calculations combining parent and item values

### Alias Path Rewriting
**Goal:** Support complex path resolution with innermost-first alias matching in nested iterations.

**Implementation:** Multi-level context injection with priority-based path resolution.

## Next Steps
1. Set up test environment for new component
2. Begin Increment 1 (write tests first)
3. Implement until tests pass
4. Ship increment and move to next
5. After Increment 3: demo basic feature to stakeholders
6. After Increment 6: ready for beta testing
7. After Increment 7: ready for production

## Development Examples
Create working examples in `dev/projects/` folder to manually test during development:

**Suggested examples:**
- `dev/projects/group-iterate-photos/` - Photo gallery editor (Example 1)
- `dev/projects/group-iterate-todos/` - Todo list (Example 2)
- `dev/projects/group-iterate-nested/` - Nested orders/line items (Example 4)

Each example should include:
- `index.html` - Entry point
- `main.js` - Vue app initialization
- `app.vue` - Component with schema and model

These examples serve as:
- Manual testing during development
- Visual verification of each increment
- Documentation for future developers
- Demo material for stakeholders
 
