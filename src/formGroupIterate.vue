<template>
	<div class="form-group-iterate">
		<form-group
			v-for="(item, index) in resolvedItems"
			:key="getIterationKey(item, index)"
			:fields="fields"
			:group="group"
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
	</div>
</template>

<script>
import formGroup from "./formGroup.vue";
import { resolveIterationItems, generateIterationKey } from "./utils/iteration";

export default {
	name: "FormGroupIterate",
	components: { formGroup },
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
		}
	}
};
</script>

<style lang="scss">
.form-group-iterate {
	// Wrapper container for iterated groups
	// Individual groups styled by their own classes
}
</style>
