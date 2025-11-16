<template>
	<fieldset v-if="fields" :is="tag" :class="[groupRowClasses, validationClass]" ref="group">
		<slot name="group-legend" :group="group" :group-legend="groupLegend"></slot>
		<slot name="group-help" :group="group"></slot>
		<template v-for="(field, index) in fields">
			<template v-if="fieldVisible(field)">
				<template v-if="field.type === 'group'">
					<form-group
						:fields="field.fields"
						:group="field"
						:tag="getGroupTag(field)"
						:model="model"
						:options="options"
						:errors="errors"
						:event-bus="eventBus"
						:key="index"
						v-bind="setFormGroupAttributes(index)"
					>
						<template slot="group-legend" slot-scope="slotProps">
							<slot
								name="group-legend"
								:group="slotProps.group"
								:group-legend="slotProps.groupLegend"
							></slot>
						</template>
						<template slot="group-help" slot-scope="slotProps">
							<slot name="group-help" :group="slotProps.group"></slot>
						</template>

						<template slot="element" slot-scope="slotProps">
							<slot
								name="element"
								:field="slotProps.field"
								:model="slotProps.model"
								:options="slotProps.options"
								:errors="slotProps.errors"
								:event-bus="slotProps.eventBus"
							></slot>
						</template>
					</form-group>
			</template>
			<template v-else-if="field.type === 'content'">
				<field-content :schema="field" :key="index" />
			</template>
			<template v-else>
				<slot
					name="element"
					:field="field"
					:model="model"
					:options="options"
					:errors="errors"
					:event-bus="eventBus"
				></slot>
			</template>
			</template>
		</template>
	</fieldset>
</template>
<script>
import formMixin from "./formMixin.js";
import fieldContent from "./fields/core/fieldContent.vue";
import { get as objGet, isFunction, isNil } from "lodash";

export default {
	name: "FormGroup",
	components: { fieldContent },
	mixins: [formMixin],
	props: {
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
			default: "fieldset",
			validator(value) {
				return value.length > 0;
			}
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
	data() {
		return {
			validationClass: {}
		};
	},
	computed: {
		groupLegend() {
			if (this.group && this.group.legend) {
				return this.group.legend;
			}
			return null;
		},
		groupRowClasses() {
			// TODO find a way to detect errors in child to add some classes (error/valid/etc)
			let baseClasses = {
				"field-group": true
			};
			if (!isNil(this.group)) {
				baseClasses = this.getStyleClasses(this.group, baseClasses);
			}
			return baseClasses;
		}
	},
	methods: {
		setFormGroupAttributes(index) {
			return this.fields[index]?.attributes?.formGroup || this.fields[index]?.attributes || {};
		},
		// Get visible prop of field
		fieldVisible(field) {
			if (isFunction(field.visible)) {
				return field.visible.call(this, this.model, field, this);
			}

			if (isNil(field.visible)) {
				return true;
			}

			return field.visible;
		},

		getGroupTag(field) {
			if (!isNil(field.tag)) {
				return field.tag;
			} else {
				return this.tag;
			}
		}
	},
	created() {
		this.eventBus.$on("field-validated", () => {
			this.$nextTick(() => {
				let containFieldWithError =
					this.$refs.group.querySelector(
						".form-element." + objGet(this.options, "validationErrorClass", "error")
					) !== null;
				this.validationClass = {
					[objGet(this.options, "validationErrorClass", "error")]: containFieldWithError,
					[objGet(this.options, "validationSuccessClass", "valid")]: !containFieldWithError
				};
			});
		});
	}
};
</script>
