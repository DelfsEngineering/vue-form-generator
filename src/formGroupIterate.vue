<template>
	<!-- Minimal wrapper required by Vue 2 (like formGroup uses fieldset) -->
	<component :is="wrapperTag" :class="wrapperClasses">
		<form-group
			v-for="(item, index) in resolvedItems"
			:key="getIterationKey(item, index)"
			:fields="fields"
			:group="getItemGroup(item)"
			:tag="tag"
			:model="item"
			:options="options"
			:errors="errors"
			:event-bus="eventBus"
		>
			<!-- Pass through all slots -->
			<template v-for="(_, slot) in $scopedSlots" #[slot]="slotProps">
				<slot :name="slot" v-bind="slotProps" />
			</template>
		</form-group>
	</component>
</template>

<script>
import { resolveIterationItems, generateIterationKey } from "./utils/iteration";

export default {
	name: "FormGroupIterate",
	components: {
		// Use beforeCreate hook to register formGroup after both modules are loaded
		// This breaks the circular dependency
	},
	beforeCreate() {
		// Register formGroup component dynamically to avoid circular dependency
		this.$options.components.formGroup = require("./formGroup.vue").default;
	},
	props: {
		iterate: {
			type: Object,
			required: true
		},
		fields: {
			type: Array,
			default() {
				return [];
			}
		},
		group: {
			type: Object,
			default() {
				return {};
			}
		},
		tag: {
			type: String,
			default: "fieldset"
		},
		model: {
			type: Object,
			default() {
				return {};
			}
		},
		options: {
			type: Object,
			default() {
				return {};
			}
		},
		errors: {
			type: Array,
			default() {
				return [];
			}
		},
		eventBus: {
			type: Object,
			default() {
				return {};
			}
		}
	},
	computed: {
		wrapperTag() {
			// Default to div (minimal wrapper, like formGroup uses fieldset)
			// Can be customized via iterate.wrapperTag
			return (this.iterate && this.iterate.wrapperTag) || "div";
		},
		wrapperClasses() {
			// Only apply classes if wrapperClass is explicitly provided
			if (this.iterate && this.iterate.wrapperClass) {
				return this.iterate.wrapperClass;
			}
			return "";
		},
		resolvedItems() {
			if (!this.iterate || !this.iterate.items) {
				return [];
			}
			return resolveIterationItems(this.iterate.items, this.model, this.options);
		}
	},
	methods: {
		getIterationKey(item, index) {
			if (!this.iterate) {
				return index;
			}
			return generateIterationKey(item, index, this.iterate.key);
		},
		getItemGroup(item) {
			// Clone group object to avoid mutation
			const merged = { ...this.group };

			// If styleClasses is a function, evaluate it per-item for conditional styling
			// This allows: styleClasses: (item) => item.active ? "active" : "inactive"
			if (merged.styleClasses && typeof merged.styleClasses === "function") {
				merged.styleClasses = merged.styleClasses(item);
			}

			return merged;
		}
	}
};
</script>

<style lang="scss">
</style>
