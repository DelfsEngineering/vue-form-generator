<template>
	<div
		class="form-element"
		:class="[fieldRowClasses]"
		v-bind="setFormElementAttributes"
		@focusin="onFocusIn"
		@focusout="onFocusOut"
		@focus.capture="onFocusIn"
		@blur.capture="onFocusOut"
	>
		<label v-if="fieldTypeHasLabel" :for="fieldID" :class="field.labelClasses">
			<slot name="label" :field="field" :get-value-from-option="getValueFromOption"></slot>
			<slot name="help" :field="field" :get-value-from-option="getValueFromOption"></slot>
		</label>

		<div class="field-wrap" :style="flattenFieldWrap ? 'display: contents' : null">
			<component
				ref="child"
				:is="fieldType"
				:model="model"
				:schema="field"
				:form-options="options"
				:event-bus="eventBus"
				:field-id="fieldID"
				@field-touched="onFieldTouched"
				@errors-updated="onChildValidated"
				@focus="onChildFocus"
				@blur="onChildBlur"
				@state-focused="onChildStateFocused"
			></component>
			<div v-if="buttonsAreVisible" class="buttons" v-bind="isMinimalMode ? { 'data-vfg-role': 'buttons' } : {}">
				<button
					v-for="(btn, index) in field.buttons"
					@click="buttonClickHandler(btn, field, $event)"
					:class="btn.classes"
					:key="index"
					v-text="btn.label"
				></button>
			</div>
		</div>

		<template v-if="fieldHasHint">
			<slot name="hint" :field="field" :get-value-from-option="getValueFromOption" :field-id="fieldID"></slot>
		</template>

		<template v-if="fieldHasErrors">
			<slot
				name="errors"
				:child-errors="childErrors"
				:field="field"
				:get-value-from-option="getValueFromOption"
				:field-id="fieldID"
			></slot>
		</template>
	</div>
</template>
<script>
import { get as objGet, isArray, isFunction, isNil } from "lodash";
import { slugifyFormID } from "./utils/schema";
import formMixin from "./formMixin.js";

export default {
	name: "FormElement",
	mixins: [formMixin],
	props: {
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
		field: {
			type: Object,
			required: true
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
			childErrors: [],
			childTouched: false,
			isFocused: false
		};
	},

	computed: {
		setFormElementAttributes() {
			let attrs = this.field?.attributes?.formElement || {};
			// Add stable hook only in minimal mode (legacy === false)
			if (this.isMinimalMode) {
				attrs = Object.assign({}, attrs, { "data-vfg-role": "element" });
			}
			return attrs;
		},
			enableStateClasses() {
			// Limit new state classes to minimal mode to avoid breaking legacy CSS/tests
			return this.isMinimalMode;
		},
			flattenFieldWrap() {
				// In minimal mode we flatten .field-wrap unless the field requests to keep wrappers
				const keepWrapper = objGet(this.field, "keepWrapper", false) || objGet(this.field, "wrapperMode", null) === "legacy";
				return this.isMinimalMode && !keepWrapper;
			},
		isMinimalMode() {
			// Field-level override takes precedence over form/global
			const fieldLegacy = objGet(this.field, "legacy");
			const resolvedLegacy = !isNil(fieldLegacy) ? fieldLegacy : objGet(this.options, "legacy", true);
			return resolvedLegacy === false;
		},
		isFilled() {
			const path = objGet(this.field, "model");
			const val = objGet(this.model || {}, path);
			if (val === null || val === undefined) return false;
			if (Array.isArray(val)) return val.length > 0;
			if (typeof val === "string") return val.trim().length > 0;
			return !!val;
		},
		fieldID() {
			const idPrefix = objGet(this.options, "fieldIdPrefix", "");
			return slugifyFormID(this.field, idPrefix);
		},
		// Get type of field 'field-xxx'. It'll be the name of HTML element
		fieldType() {
			return "field-" + this.field.type;
		},
		// Should field type have a label?
		fieldTypeHasLabel() {
			if (isNil(this.field.label)) {
				return false;
			}
			let fieldOptions = this.getValueFromOption(this.field, "fieldOptions");
			let condition = this.field.type === "input" && !isNil(fieldOptions);
			let relevantType = condition ? fieldOptions.inputType : this.field.type;
			const typeWithoutLabel = ["button", "submit", "reset"];

			return !typeWithoutLabel.includes(relevantType);
		},
		fieldHasHint() {
			return !isNil(this.field.hint);
		},
		fieldHasErrors() {
			return this.childErrors.length > 0;
		},
		fieldRowClasses() {
			let baseClasses = {
				[objGet(this.options, "validationErrorClass", "error")]: this.fieldHasErrors,
				[objGet(this.options, "validationSuccessClass", "valid")]: !this.fieldHasErrors && this.childTouched,
				[objGet(this.options, "validationCleanClass", "clean")]: !this.fieldHasErrors && !this.childTouched,
				disabled: this.getValueFromOption(this.field, "disabled"),
				readonly: this.getValueFromOption(this.field, "readonly"),
				featured: this.getValueFromOption(this.field, "featured"),
				required: this.getValueFromOption(this.field, "required")
			};

			if (this.enableStateClasses) {
				baseClasses.focused = this.isFocused;
				baseClasses.filled = this.isFilled;
				baseClasses.empty = !this.isFilled;
			}

			baseClasses = this.getStyleClasses(this.field, baseClasses);

			if (!isNil(this.field.type)) {
				baseClasses["field-" + this.field.type] = true;
			}

			return baseClasses;
		},
		buttonsAreVisible() {
			return isArray(this.field.buttons) && this.field.buttons.length > 0;
		}
	},
	methods: {
		onChildFocus() {
			this.isFocused = true;
		},
		onChildBlur() {
			this.isFocused = false;
		},
		onChildStateFocused(val) {
			this.isFocused = !!val;
		},
		getValueFromOption(field, option, defaultValue = false) {
			if (isFunction(field[option])) {
				return field[option].call(this, this.model, field, this);
			}

			if (isNil(field[option])) {
				return defaultValue;
			}

			return field[option];
		},

		buttonClickHandler(btn, field, event) {
			return btn.onclick.call(this, this.model, field, event, this);
		},
		onFieldTouched() {
			this.childTouched = true;
		},
		onChildValidated(errors) {
			this.childErrors = errors;
		},
		onFocusIn() {
			this.isFocused = true;
		},
		onFocusOut() {
			this.isFocused = false;
		}
	}
};
</script>
<style lang="scss">
@use "sass:color";

$errorColor: #f00;
.form-element:not([class*=" col-"]) {
	width: 100%;
}
.form-element {
	display: inline-block;
	vertical-align: top;
	// width: 100%;
	// margin: 0.5rem 0.26rem;
	margin-bottom: 1rem;

	label {
		font-weight: 400;
		& > :first-child {
			display: inline-block;
		}
	}

	&.featured {
		> label {
			font-weight: bold;
		}
	}

	&.required {
		> label:after {
			content: "*";
			font-weight: normal;
			color: Red;
			// position: absolute;
			padding-left: 0.2em;
			font-size: 1em;
		}
	}

	&.disabled {
		> label {
			color: #666;
			font-style: italic;
		}
	}

	&.error {
		input:not([type="checkbox"]),
		textarea,
		select {
			border: 1px solid $errorColor;
			background-color: color.change($errorColor, $alpha: 0.15);
		}

		.errors {
			color: $errorColor;
			font-size: 0.8em;
			span {
				display: block;
				background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAiklEQVR4Xt2TMQoCQQxF3xdhu72MpZU3GU/meBFLOztPYrVWsQmEWSaMsIXgK8P8RyYkMjO2sAN+K9gTIAmDAlzoUzE7p4IFytvDCQWJKSStYB2efcAvqZFM0BcstMx5naSDYFzfLhh/4SmRM+6Agw/xIX0tKEDFufeDNRUc4XqLRz3qabVIf3BMHwl6Ktexn3nmAAAAAElFTkSuQmCC");
				background-repeat: no-repeat;
				padding-left: 17px;
				padding-top: 0px;
				margin-top: 0.2em;
				font-weight: 600;
			}
		}
	}
}
</style>
