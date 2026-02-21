<template>
	<fieldset v-if="fields" :is="tag" :class="[groupRowClasses, validationClass]" ref="group">
		<slot name="group-legend" :group="group" :group-legend="groupLegend"></slot>
		<slot name="group-help" :group="group"></slot>
		<template v-for="(field, index) in fields">
			<template v-if="isFieldRenderable(field)">
				<!-- Non-iterated fields: check visible once, render once -->
				<template v-if="!field.iterate && fieldVisible(field)">
					<form-group
						v-if="field.type === 'group'"
						:key="index"
						:fields="field.fields"
						:group="field"
						:path="getFieldPath(index)"
						:tag="getGroupTag(field)"
						:model="model"
						:options="options"
						:errors="errors"
						:event-bus="eventBus"
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
								:field-path="slotProps.fieldPath"
								:model="slotProps.model"
								:options="slotProps.options"
								:errors="slotProps.errors"
								:event-bus="slotProps.eventBus"
							></slot>
						</template>
					</form-group>
					<field-content v-else-if="field.type === 'content'" :key="index" :schema="field" />
					<slot
						v-else
						name="element"
						:field="field"
						:field-path="getFieldPath(index)"
						:model="model"
						:options="options"
						:errors="errors"
						:event-bus="eventBus"
					></slot>
				</template>

				<!-- Iterated fields: check visible per-item, render multiple -->
				<template v-else-if="field.iterate">
					<template v-for="(item, itemIdx) in getFieldItems(field)">
						<template v-if="itemVisible(field, item, itemIdx)">
							<form-group
								v-if="field.type === 'group'"
								:key="getFieldIterationKey(field, item, itemIdx, index)"
								:fields="field.fields"
								:group="getIteratedField(field, item, itemIdx)"
								:path="getIteratedFieldPath(index, itemIdx)"
								:tag="getGroupTag(field)"
								:model="item"
								:options="options"
								:errors="errors"
								:event-bus="eventBus"
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
										:field-path="slotProps.fieldPath"
										:model="slotProps.model"
										:options="slotProps.options"
										:errors="slotProps.errors"
										:event-bus="slotProps.eventBus"
									></slot>
								</template>
							</form-group>
							<field-content
								v-else-if="field.type === 'content'"
								:key="getFieldIterationKey(field, item, itemIdx, index)"
								:schema="field"
							/>
							<slot
								v-else
								name="element"
								:field="field"
								:field-path="getIteratedFieldPath(index, itemIdx)"
								:model="item"
								:options="options"
								:errors="errors"
								:event-bus="eventBus"
							></slot>
						</template>
					</template>
				</template>
			</template>
			<template v-else-if="showInvalidWarnings">
				<div :key="'invalid-' + index" class="vfg-field-warning" :style="invalidFieldStyle">
					<strong>Invalid field</strong>
					<div>{{ invalidFieldMessage(field, index) }}</div>
				</div>
			</template>
		</template>
	</fieldset>
</template>
<script>
import formMixin from "./formMixin.js";
import fieldContent from "./fields/core/fieldContent.vue";
import { resolveIterationItems, generateIterationKey } from "./utils/iteration";
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
		path: {
			type: String,
			default: "root"
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
			validationClass: {},
			warnedInvalidFields: {}
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
		},
		invalidFieldStyle() {
			return {
				padding: "8px 12px",
				margin: "8px 0",
				border: "1px dashed #e0a800",
				background: "#fff9e6",
				color: "#6b4c00",
				fontSize: "13px"
			};
		},
		showInvalidWarnings() {
			return !!objGet(this.options, "devMode", false);
		}
	},
	methods: {
		setFormGroupAttributes(index) {
			return this.fields[index]?.attributes?.formGroup || this.fields[index]?.attributes || {};
		},
		isFieldRenderable(field) {
			return !isNil(field) && !isNil(field.type);
		},
		// Get visible prop of field (for non-iterated fields)
		fieldVisible(field) {
			if (isFunction(field.visible)) {
				return field.visible.call(this, this.model, field, this);
			}

			if (isNil(field.visible)) {
				return true;
			}

			return field.visible;
		},

		// Check visible per-item (for iterated fields)
		itemVisible(field, item, index) {
			if (!field.visible) {
				return true; // No visible property = show all items
			}

			if (isFunction(field.visible)) {
				// Call visible function with ITEM model and INDEX
				return field.visible.call(this, item, index, field, this);
			}

			return field.visible;
		},

		getGroupTag(field) {
			if (!isNil(field.tag)) {
				return field.tag;
			} else {
				return this.tag;
			}
		},
		getFieldPath(fieldIdx) {
			return `${this.path}.fields[${fieldIdx}]`;
		},
		getIteratedFieldPath(fieldIdx, itemIdx) {
			return `${this.path}.fields[${fieldIdx}].iterate[${itemIdx}]`;
		},

		// Iteration support methods
		getFieldItems(field) {
			// If field has iterate property, resolve items array
			if (field.iterate && field.iterate.items) {
				return resolveIterationItems(field.iterate.items, this.model, this.options);
			}
			// Otherwise, treat as single item (no iteration)
			return [this.model];
		},

		getFieldIterationKey(field, item, itemIdx, fieldIdx) {
			// If field has iterate, generate key for this item
			if (field.iterate) {
				const key = field.iterate.key ? generateIterationKey(item, itemIdx, field.iterate.key) : itemIdx;
				return `${fieldIdx}-${key}`;
			}
			// No iteration, use field index
			return fieldIdx;
		},

		getIteratedField(field, item, index) {
			// If field has iterate and styleClasses is a function, evaluate it per item
			if (field.iterate && field.styleClasses && typeof field.styleClasses === "function") {
				return {
					...field,
					styleClasses: field.styleClasses(item, index)
				};
			}
			return field;
		},

		invalidFieldReason(field) {
			if (isNil(field)) {
				return "entry is null or undefined";
			}
			if (typeof field !== "object") {
				return `entry is a ${typeof field}, expected an object`;
			}
			if (isNil(field.type)) {
				return 'missing required "type" property';
			}
			return "unusable field configuration";
		},
		invalidFieldMessage(field, index) {
			const reason = this.invalidFieldReason(field);
			this.logInvalidField(reason, field, index);
			return `Invalid field at index ${index}: ${reason}. Each field should be an object with a "type".`;
		},
		logInvalidField(reason, field, index) {
			if (!this.showInvalidWarnings) {
				return;
			}
			if (this.warnedInvalidFields[index]) {
				return;
			}
			this.$set(this.warnedInvalidFields, index, true);
			console.warn(
				`[vue-form-generator] Invalid field at index ${index}: ${reason}. Ensure each entry is an object with a "type" property.`,
				field
			);
		}
	},
	watch: {
		fields(newVal, oldVal) {
			if (newVal !== oldVal) {
				this.warnedInvalidFields = {};
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
