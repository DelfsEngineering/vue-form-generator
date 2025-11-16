<template>
	<component :is="elementTag" v-bind="elementAttrs">
		<template v-if="schema.html">
			<span v-html="schema.html"></span>
		</template>
		<template v-else-if="hasChildren">
			<field-content v-for="(child, idx) in schema.children" :key="childKey(child, idx)" :schema="child" />
		</template>
		<template v-else>{{ schema.text }}</template>
	</component>
</template>

<script>
export default {
	name: "FieldContent",
	props: {
		schema: {
			type: Object,
			required: true
		}
	},
	computed: {
		elementTag() {
			return this.schema.element || "div";
		},
		elementAttrs() {
			const attrs = { ...(this.schema.attrs || {}) };
			// Add data-idbf for identity (will implement in Test Suite 4)
			if (this.schema.id) {
				attrs["data-idbf"] = this.schema.id;
			}
			return attrs;
		},
		hasChildren() {
			return Array.isArray(this.schema.children) && this.schema.children.length > 0;
		}
	},
	methods: {
		childKey(child, idx) {
			return child.id || `child_${idx}`;
		}
	}
};
</script>
