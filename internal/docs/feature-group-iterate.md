# Feature: Group Iteration (Spec)

## Goal
Provide a schema-level way to render a `group` once per item in an array, without requiring custom HTML elements in consuming apps.

## Status
**Architecture Defined** - Ready for implementation planning.

## Summary
Introduce a new schema element that behaves like `group` but adds iteration semantics (Vue `v-for`-like) for rendering arrays of data.

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
    key: "id",          // key path or function (optional)
    wrapperTag: "div",  // HTML tag for wrapper (optional, default: no wrapper)
    wrapperClass: ""    // CSS classes for wrapper (optional)
  },
  styleClasses: "card-styling",  // Applied to EACH iterated item (like regular group)
  fields: [
    { type: "input", model: "title" },    // relative paths to item properties
    { type: "input", model: "caption" }
  ]
}
```
 
### Required vs Optional
- `type`: required (new element)
- `iterate.items`: required
- `iterate.key`: optional (see Key Behavior)
- `iterate.wrapperTag`: optional (creates wrapper element if provided)
- `iterate.wrapperClass`: optional (styles wrapper if wrapperTag provided)
- `styleClasses`: optional (applied to EACH item, consistent with `type: "group"`)
- `fields`: required (same as group)

### API Consistency with `type: "group"`
**Important:** `group-iterate` behaves like `type: "group"` but repeated. To maintain API consistency:
- `styleClasses` on the field applies to **each iterated item** (not a wrapper)
- By default, **no wrapper element** is added (minimizes DOM)
- To add a wrapper container, use `iterate.wrapperTag` and `iterate.wrapperClass`
- Each iteration renders like a standalone `group` with its styling

### Recommended Pattern: Wrap in a Regular Group
**Best Practice:** Wrap `group-iterate` inside a regular `type: "group"` for proper container control:

```javascript
{
  type: "group",
  styleClasses: "col-md-12",  // Outer container styling
  fields: [
    {
      type: "group-iterate",
      styleClasses: "card card-body mb-3",  // Applied to EACH item
      iterate: {
        items: "photos",
        key: "id"
      },
      fields: [
        { type: "input", model: "title" }
      ]
    }
  ]
}
```

This pattern provides:
- Clear separation between container (outer group) and items (group-iterate)
- Better control over layout and spacing
- Consistent with how regular groups are used in forms
 
## Model Scope

Each iteration item becomes the model object passed to child fields. Fields use **relative paths** to access item properties:

```javascript
// Model structure
{
  photos: [
    { id: 1, title: "Beach", url: "beach.jpg" },
    { id: 2, title: "Mountain", url: "mountain.jpg" }
  ]
}

// Schema - fields access item properties directly
{
  type: "group-iterate",
  iterate: { items: "photos" },
  fields: [
    { type: "input", model: "title" },    // item.title
    { type: "input", model: "url" }      // item.url
  ]
}
```

**Path Resolution:** Uses standard lodash `objGet` for nested property access with dotted notation.

## DOM Structure and Styling

### No Extra Wrapper by Default
Like `type: "group"`, `group-iterate` does NOT add unnecessary DOM elements. By default:
- Each iteration renders a `form-group` component with its fields
- `styleClasses` on the field applies to each iterated `form-group`
- No container/wrapper element is created

```javascript
// This schema:
{
  type: "group-iterate",
  iterate: { items: "todos", key: "id" },
  styleClasses: "todo-card",
  fields: [{ type: "input", model: "title" }]
}

// Renders as (simplified):
<form-group class="todo-card">...</form-group>  <!-- Item 1 -->
<form-group class="todo-card">...</form-group>  <!-- Item 2 -->
<form-group class="todo-card">...</form-group>  <!-- Item 3 -->
```

### Optional Wrapper Container
If you need a container element (e.g., for flexbox/grid layout), use `iterate.wrapperTag` and `iterate.wrapperClass`:

```javascript
{
  type: "group-iterate",
  iterate: { 
    items: "todos", 
    wrapperTag: "div",           // Creates wrapper element
    wrapperClass: "flex gap-4"   // Styles the wrapper
  },
  styleClasses: "todo-card",     // Still applies to EACH item
  fields: [...]
}

// Renders as:
<div class="flex gap-4">                      <!-- Wrapper -->
  <form-group class="todo-card">...</form-group>
  <form-group class="todo-card">...</form-group>
</div>
```

### Styling Best Practices
- **Item styling:** Use `styleClasses` (consistent with `type: "group"`)
- **Wrapper styling:** Only use `iterate.wrapperClass` if you need a container
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
 
## ID Collisions
Repeating a group with identical field schemas can produce duplicate DOM IDs.

### Solution: Automatic ID Prefix per Iteration
- Each `group-iterate` extends the `fieldIdPrefix` option for its children.
- Format: `{parentPrefix}-{iterationKey}-` where `iterationKey` is the resolved key or index.
- Example: A field with model `"title"` in iteration 0 becomes `"frm1-0-title"` (if parent prefix is `"frm1-"`).
- Applies to `fieldId` and all derived `aria-*` IDs automatically.
 
## Nested Iteration
`group-iterate` can be nested to handle multi-level data structures. Each level receives its iteration item as the model, so paths are always relative to the current item.

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
  type: "group-iterate",
  iterate: { items: "orders", key: "id" },  // Root level: iterates model.orders
  fields: [
    { type: "input", model: "customer" },  // Reads from current order
    {
      type: "group-iterate",
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
          type: "group-iterate",
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
          type: "group-iterate",
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
          type: "group-iterate",
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
          type: "group-iterate",
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
          type: "group-iterate",
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
          type: "group-iterate",
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
- ✅ **Name:** `type: "group-iterate"`
- ✅ **Scope:** `scope: "item"` only (item becomes model, relative paths)
- ✅ **Async items:** Not supported initially
- ✅ **Key paths:** Support nested paths via `objGet`
- ✅ **ID suffix:** Always auto-generated from key or index
- ✅ **Implementation:** Simple v-for rendering (no path rewriting)

## Implementation Overview

### New Component: `formGroupIterate.vue`
- Handles v-for iteration over items array
- Resolves `iterate.items` (string path or function)
- Passes each iteration item as the model to child fields
- Extends `fieldIdPrefix` for child fields
- Handles key generation from `iterate.key`
- Renders `form-group` for each item with `styleClasses` applied
- Optionally creates wrapper element via `iterate.wrapperTag`
- Evaluates `styleClasses` function per-item for conditional styling

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

### Increment 5: Nested Iteration
**Goal:** Support nested group-iterate with simple model passing

**Tests:**
- Each iteration level receives its item as the model
- Paths are relative to current iteration level
- Test 3-level nesting
- Verify models are passed correctly through nesting

**Implementation:**
- Pass iteration item as model to child fields
- No complex context resolution needed

**Shippable:** ✅ Yes! Nested iteration works

**Usage at this stage:**
```javascript
{
  type: "group-iterate",
  iterate: { items: "orders" },
  fields: [
    { type: "input", model: "customerName" },
    {
      type: "group-iterate",
      iterate: { items: "lineItems" },
      fields: [
        { model: "quantity" },
        { model: "price" }
      ]
    }
  ]
}
```

---

### Increment 6: FormGroup Integration
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
 
