<template>
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
	// Note: FormGroup component is not imported to avoid circular dependency.
	// It will be resolved at runtime since formGroup registers formGroupIterate.
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
			// Allow customization via iterate.wrapperTag, default to div
			return (this.iterate && this.iterate.wrapperTag) || "div";
		},
		wrapperClasses() {
			// Priority 1: group.styleClasses (field-level, passed via :group="field")
			// Priority 2: iterate.wrapperClass (config-level, for backward compat)
			if (this.group && this.group.styleClasses) {
				return this.group.styleClasses;
			}
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
			// Merge group with itemClass from iterate config
			const merged = { ...this.group };
			if (this.iterate && this.iterate.itemClass) {
				// If itemClass is a function, call it with the item model
				if (typeof this.iterate.itemClass === "function") {
					merged.styleClasses = this.iterate.itemClass(item);
				} else {
					merged.styleClasses = this.iterate.itemClass;
				}
			}
			return merged;
		}
	}
};
</script>

<style lang="scss">
// Styling for iterated groups
// Target by field type in parent, e.g.:
// .field-group-iterate > fieldset { ... }
</style>
