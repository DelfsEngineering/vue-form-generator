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
```

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


