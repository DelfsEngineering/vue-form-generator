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
import { resolveIterationItems, generateIterationKey } from "./utils/iteration";

export default {
	name: "FormGroupIterate",
	// Note: FormGroup component uses a lazy function to avoid circular dependency
	components: {
		FormGroup: () => import("./formGroup.vue")
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
	> fieldset {
		background-color: #e3f2fd;
		padding: 20px;
		margin-bottom: 15px;
		border-radius: 8px;
		border: 1px solid #bbdefb;

		// Nested group-iterate styling
		.form-group-iterate {
			> fieldset {
				background-color: #fff3e0;
				border: 1px solid #ffcc80;
				padding: 15px;
				margin-top: 10px;

				// Third level nesting (if needed)
				.form-group-iterate {
					> fieldset {
						background-color: #f1f8e9;
						border: 1px solid #c5e1a5;
					}
				}
			}
		}
	}
}
</style>
