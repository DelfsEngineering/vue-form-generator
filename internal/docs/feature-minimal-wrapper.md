# Feature: Minimal Wrapper for Stable Slot Rendering in Tests (Vue 2.7)

Context

- While migrating tests to Vue 2.7 + @vue/test-utils 1.3.x, some components (e.g., `FormGroup`) render their content exclusively via named scoped slots (`group-legend`, `element`).
- Directly mounting such components makes DOM assertions brittle or empty because the slot content is provided by the parent, not by the component itself.

Solution: Use a tiny wrapper component in tests to provide the slot content and assert against a stable, minimal DOM.

Example Wrapper (used in `formGroup.spec.js`)

```vue
<template>
  <form-group
    :fields="fields"
    :group="group"
    :model="model"
    :options="options"
    :errors="errors"
    :event-bus="eventBus"
    :tag="tag"
  >
    <template slot="group-legend" slot-scope="slotProps">
      <legend v-if="slotProps.groupLegend">{{ slotProps.groupLegend }}</legend>
    </template>
    <template slot="element" slot-scope="slotProps">
      <div class="form-group"></div>
    </template>
  </form-group>
  
</template>

<script>
import FormGroup from "@/formGroup.vue";

export default {
  name: "GroupWrapper",
  components: { FormGroup },
  props: {
    fields: { type: Array, default: () => [] },
    group: { type: Object, default: () => ({}) },
    model: { type: Object, default: () => ({}) },
    options: { type: Object, default: () => ({}) },
    errors: { type: Array, default: () => [] },
    eventBus: { type: Object, default: () => ({ $on: () => {}, $off: () => {} }) },
    tag: { type: String, default: "fieldset" }
  }
};
</script>

How to Use in a Test

```js
const wrapper = mount(GroupWrapper, {
  localVue,
  propsData: {
    group: { legend: "My Legend", styleClasses: ["class1", "class2"] },
    fields: [{ type: "input", model: "name" }],
    model: { name: "Alice" }
  }
});

// Legend assertions
expect(wrapper.find("legend").exists()).to.be.true;
expect(wrapper.find("legend").text()).to.equal("My Legend");

// Child element assertions
expect(wrapper.findAll(".form-group").length).to.equal(1);
```

Why This Helps

- Keeps tests resilient: assertions target stable, intentionally minimal markup from the wrapper, not internal implementation details of the component.
- Mirrors real usage: production parents provide the slots; the wrapper does the same.
- Simplifies visibility/style testing: we can toggle `group`/`fields` props and assert on presence of `.form-group` and classes on the root `<fieldset>`.

Notes for Vue 2.7 Reactivity in Tests

- When changing props/models inside tests, pair updates with:
  ```js
  await wrapper.vm.$nextTick();
  // In rare cases
  wrapper.vm.$forceUpdate();
  await wrapper.vm.$nextTick();
  ```
- This mitigates DOM update timing issues seen with Vue 2.7 + @vue/test-utils.

Scope & Limitations

- This wrapper is intended for tests only. Do not ship it in runtime bundles.
- If slots need richer structure for a test, extend the wrapper’s templates locally in the spec (keep them minimal by default).

Changelog

- Introduced during v3 test stabilization to make `formGroup.spec.js` deterministic.



---

# Feature: Minimal Wrapper Mode (v3.1)

## Summary
Opt-in rendering mode that removes non-essential wrappers, adds stable hooks, and sets accessibility and state-class defaults. Default remains legacy; minimal mode is enabled via a boolean `legacy` toggle.

## Public Toggle
- Form-level: `<vue-form-generator :legacy="false" />` (default `true`)
- Field-level: `{ type: 'input', model: 'name', legacy: false }`
- Precedence: field.legacy > form legacy (defaults to `true`)
- Mapping: `legacy=true` → legacy wrappers; `legacy=false` → minimal wrappers

## Proposed DOM (Minimal)
```html
<div class="form-element field-input filled" data-vfg-role="element">
  <label for="name">Name</label>
  <input id="name" class="form-control" data-vfg-role="control" aria-describedby="name-hint name-errors" />
  <div class="buttons" data-vfg-role="buttons">...</div>
  <div class="hint" id="name-hint" data-vfg-role="hint">Hint</div>
  <div class="errors" id="name-errors" data-vfg-role="errors" aria-live="polite">...</div>
  <!-- If a wrapper is required for a complex widget: -->
  <!-- <div class="wrapper" data-vfg-role="control-wrapper"> ...control... </div> -->
  <!-- Legacy class names are preserved when wrappers are kept. -->
</div>
```

## Stable Hooks (emitted only when legacy=false)
- `[data-vfg-role="element"]`: `.form-element` container
- `[data-vfg-role="control"]`: actual interactive node (input/select/textarea or widget root)
- `[data-vfg-role="hint"]`, `[data-vfg-role="errors"]`, `[data-vfg-role="buttons"]`
- `[data-vfg-role="control-wrapper"]`: only when a wrapper is necessary

Rationale: universal styling/testing selectors without coupling to internal structure or tag names.

## Accessibility
Defaults (approved):
- Errors: `aria-live="polite"` on errors container (per field)
- Describe-by: control sets `${fieldID}-hint` and `${fieldID}-errors` in `aria-describedby`
- Submit with errors: focus first invalid control; form-level error summary (`role="alert"`) available

Overrides:
```js
options.a11y = { errorsLive: 'polite'|'assertive'|'off', describeBy: true|false, errorSummary: true|false }
schema.a11y  // per-field override
```

Acceptance criteria:
- Errors container has `aria-live` (default polite)
- `aria-describedby` references stable hint/errors IDs
- Focus moves to first invalid control on submit; summary region present

Implementation status (v3.1):
- Implemented: `aria-live`, `aria-describedby`, focus-first-invalid
- Implemented: `data-vfg-role` for `element`, `control`, `hint`, `errors`, `buttons`, and `control-wrapper`
- Implemented: wrapper flattening via `display: contents` on `.field-wrap` and the field `.wrapper` in minimal mode, with automatic wrapper retention for complex fields

ID naming (approved): `${fieldID}-hint`, `${fieldID}-errors` (hyphen).

## State Classes on `.form-element`
- Always: `error`, `valid`, `clean`, `disabled`, `readonly`, `featured`, `required`, `field-<type>`
- New (approved): `focused`, `filled`, `empty` (inverse of `filled`)

Tailwind floating label example:
```css
@layer components {
  .floating-label { @apply relative; }
  .floating-label label { @apply absolute left-3 top-2 text-slate-500 transition-all pointer-events-none; }
  .floating-label.filled label, .floating-label.focused label { @apply -translate-y-3 scale-90 text-slate-700; }
}
```

## Wrapper Policy (Minimal Mode)
- Use `display: contents` for wrapper-only elements to reduce DOM depth
- Auto-fallback to a normal wrapper when a field needs it for layout/JS init
- Per-field opt-out: `field.wrapperMode='legacy'` or `keepWrapper: true`
- Likely wrapper keepers: file upload/image previewers, rich text editors, complex sliders/date-time pickers
- Legacy class names (`.field-wrap`, `.wrapper`) are retained where wrappers remain; `data-vfg-role="control-wrapper"` is additive

## Styling and Layout (styleClasses with raw Tailwind)
- Author with Tailwind directly in `styleClasses` (no layout tokens or namespace)
Examples:
```json
{ "type": "section", "styleClasses": "flex flex-col gap-6" }
{ "type": "section", "styleClasses": "grid grid-cols-2 gap-4 md:grid-cols-3" }
{ "type": "field",   "fieldType": "input", "model": "name", "styleClasses": "col-span-2" }
```

Renderer rules:
- No layout-only wrappers; apply classes to existing nodes
- Grid/flex on container (`section` or `.form-element`), not on an inner wrapper
- Use data-vfg-role hooks for precise targeting when needed

Class overrides cheat sheet:
- `styleClasses`: container/schema node (e.g., `.form-element`, `section`)
- `fieldClasses`: control node (input/select/textarea or widget root)
- `labelClasses`: label node
- `attributes.*`: granular targets: `formElement`, `formGroup`, `input`, `label`, `wrapper`

## BetterForms Integration
- Keep a single semantic root; avoid nested forms
- Flatten cosmetic wrappers via CSS (`display: contents`) where safe; keep `.form-element`
- Add a dev toggle to switch `legacy` on/off at runtime for migration

## HTML Content Schema
Node model:
- `element` (tag), `attrs` (id/class/href/aria/data-*), `children` (element/text), `text`
Identity policy (approved):
- `data-idbf` is the canonical identity; prefixes: `idbf_g_*` (groups), `idbf_e_*` (fields), `idbf_c_*` (content)
- Auto-generate short IDs; never re-key on reorder; emit in DOM (identity-only)
- Styling vs identity: use data-vfg-role for styling; data-idbf for editor/AI selection

Sanitization policy (approved):
- Trusted HTML with 1:1 fidelity (no automatic sanitization). Editor/workflow lint/validate.

## Browser Support
- Modern evergreen browsers (Chrome, Edge, Firefox, Safari)
- Minimal mode uses `display: contents`; when unsafe/unsupported, automatic wrapper fallback

## Rollout
- v3.1: minimal mode opt-in; class mirroring ON by default
- v3.3: flip mirroring default OFF
- v4.0: consider removal of mirroring

## TDD Implementation Plan (high level)
1) Roles: tests ensure roles appear only when `legacy=false`; implement in `formElement.vue` + `fieldInput.vue` (DONE)
2) A11y: tests for `aria-live` + `aria-describedby` + submit focus; implement in `formGenerator.vue` + fields (DONE)
3) State classes: tests for `.focused/.filled/.empty`; implement event/value tracking (DONE)
4) Minimal wrappers: tests assert input wrapper minimized; implement safe removal/`display: contents` + fallback (DONE)
5) Overrides: tests for field.legacy precedence; implement
6) Wrapper keepers: tests for upload/image; keep wrappers by default; implement override flag
7) Compat mirroring: tests for `.help-block`/`.field-wrap` mirroring; implement

## Before → After (single text field)

Worst (legacy-heavy):
```html
<div class="form-element field-input">
  <label class="control-label" for="name">Name</label>
  <div class="field-wrap">
    <div class="wrapper">
      <input id="name" class="form-control" />
      <span class="helper"></span>
    </div>
    <div class="buttons"></div>
  </div>
  <div class="hint help-block">Hint</div>
  <div class="errors help-block"></div>
</div>
```

Best (minimal):
```html
<div class="form-element field-input filled" data-vfg-role="element">
  <label for="name">Name</label>
  <input id="name" class="form-control" data-vfg-role="control" aria-describedby="name-hint name-errors" />
  <div id="name-hint" class="hint" data-vfg-role="hint">Hint</div>
  <div id="name-errors" class="errors" data-vfg-role="errors" aria-live="polite"></div>
</div>
```

Notes:
- Local overrides confirmed: `styleClasses`, `fieldClasses`, `labelClasses`, `attributes.*`
- `data-vfg-role` is for stable styling/testing; `data-idbf` is for identity (editor/AI)

---

# Content Field Type (v3.1)

## Summary
Schema-driven HTML rendering without `.form-element` wrapper div. Perfect for AI-generated layouts, semantic HTML structures, and precise DOM control.

## Usage

```javascript
{
  type: "content",
  element: "h1",           // HTML tag (default: "div")
  text: "Simple text",     // text content
  // OR
  html: "<strong>HTML</strong>", // raw HTML
  // OR
  children: [              // nested elements (recursive)
    { element: "span", text: "Child 1" },
    { element: "span", text: "Child 2" }
  ],
  attrs: {                 // any HTML attributes
    class: "heading",
    id: "page-title",
    "data-testid": "main"
  },
  id: "idbf_c_header"     // optional: stable identity for editor/AI
}
```

## Examples

**Simple heading:**
```javascript
{ type: "content", element: "h1", text: "Welcome", attrs: { class: "title" } }
```

**Nested structure:**
```javascript
{
  type: "content",
  element: "div",
  attrs: { class: "alert alert-info" },
  children: [
    { element: "strong", text: "Note: " },
    { element: "span", text: "Please read carefully" }
  ]
}
```

**Mixed with form fields:**
```javascript
schema: {
  fields: [
    { type: "content", element: "h1", text: "User Form" },
    { type: "content", element: "p", text: "Enter your details" },
    { type: "input", model: "name", label: "Name" },
    { type: "content", element: "hr" },
    { type: "submit", label: "Save" }
  ]
}
```

## Implementation Status

✅ Fully implemented in v3.1:
- Component: `src/fields/core/fieldContent.vue`
- Wrapper bypass in `formGroup.vue`
- Registered in `fieldsLoader.js`
- Test coverage: 18 unit tests + 5 integration tests
- Demo: `dev/projects/content-field/`

## Benefits

1. **AI-Friendly:** Clean DOM without structural noise
2. **Semantic HTML:** Build proper document structure
3. **No Wrappers:** Direct rendering, no `.form-element` div
4. **Schema-Driven:** Everything configurable via JSON
5. **Recursive:** Supports unlimited nesting
6. **Identity System:** `data-idbf` for editor/AI targeting

---

# Appendix: Test Slot Wrapper (kept from earlier)

(This appendix explains the small test-only wrapper pattern used to render slot content deterministically in unit tests. See the top section for details and example usage.)
