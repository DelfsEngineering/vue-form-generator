<template>
	<div
		class="wrapper"
		v-attributes="'wrapper'"
		:style="flattenControlWrapper ? 'display: contents' : null"
		v-bind="controlWrapperAttrs"
	>
		<input
			class="form-control"
			v-bind="controlAttrs"
			:id="fieldId"
			:type="inputType"
			:value="value"
			@input="onInput"
			@blur="onBlur"
			@focus="onFocus"
			:class="fieldClasses"
			@change="schema.onChange || null"
			:disabled="disabled"
			:accept="fieldOptions.accept"
			:alt="fieldOptions.alt"
			:autocomplete="fieldOptions.autocomplete"
			:checked="fieldOptions.checked"
			:dirname="fieldOptions.dirname"
			:formaction="fieldOptions.formaction"
			:formenctype="fieldOptions.formenctype"
			:formmethod="fieldOptions.formmethod"
			:formnovalidate="fieldOptions.formnovalidate"
			:formtarget="fieldOptions.formtarget"
			:height="fieldOptions.height"
			:list="fieldOptions.list"
			:max="fieldOptions.max"
			:maxlength="fieldOptions.maxlength"
			:min="fieldOptions.min"
			:minlength="fieldOptions.minlength"
			:multiple="fieldOptions.multiple"
			:name="inputName"
			:pattern="fieldOptions.pattern"
			:placeholder="placeholder"
			:readonly="readonly"
			:required="schema.required"
			:size="fieldOptions.size"
			:src="fieldOptions.src"
			:step="fieldOptions.step"
			:width="fieldOptions.width"
			:files="fieldOptions.files"
			v-attributes="'input'"
		/>
		<span class="helper" v-if="inputType === 'color' || inputType === 'range'" v-text="value"></span>
	</div>
</template>

<script>
import abstractField from "../abstractField";
import { debounce, get as objGet, isFunction, isNumber } from "lodash";
import fecha from "fecha";

const DATETIME_FORMATS = {
	date: "YYYY-MM-DD",
	datetime: "YYYY-MM-DD HH:mm:ss",
	"datetime-local": "YYYY-MM-DDTHH:mm:ss"
};

export default {
	name: "FieldInput",
	mixins: [abstractField],

	computed: {
		inputType() {
			if (typeof this.fieldOptions.inputType !== "undefined") {
				return this.fieldOptions.inputType.toLowerCase();
			} else {
				console.warn("Missing inputType", this.fieldOptions, this.fieldOptions.inputType);
				return null;
			}
		},
		ariaDescribedBy() {
			return `${this.fieldId}-hint ${this.fieldId}-errors`;
		},
		controlAttrs() {
			const attrs = { "aria-describedby": this.ariaDescribedBy };
			if (this.isMinimalMode()) {
				attrs["data-vfg-role"] = "control";
			}
			return attrs;
		},
		flattenControlWrapper() {
			const keepWrapper =
				objGet(this.schema || {}, "keepWrapper", false) ||
				objGet(this.schema || {}, "wrapperMode", null) === "legacy";
			return this.isMinimalMode() && !keepWrapper;
		},
		controlWrapperAttrs() {
			if (this.flattenControlWrapper) {
				return { "data-vfg-role": "control-wrapper" };
			}
			return {};
		}
	},
	methods: {
		onFocus() {
			this.$emit("focus");
			this.$emit("state-focused", true);
			// Also dispatch a bubbling focusin to help parent containers react in tests/environments
			try {
				if (this.$el && typeof this.$el.dispatchEvent === "function") {
					this.$el.dispatchEvent(new window.Event("focusin", { bubbles: true }));
				}
			} catch (e) {
				// no-op
			}
		},
		isMinimalMode() {
			const fieldLegacy = objGet(this.schema || {}, "legacy");
			const resolvedLegacy =
				typeof fieldLegacy !== "undefined" ? fieldLegacy : objGet(this.formOptions || {}, "legacy", true);
			return resolvedLegacy === false;
		},
		formatValueToModel(value) {
			if (value != null) {
				switch (this.inputType) {
					case "date":
					case "datetime":
					case "datetime-local":
					case "number":
					case "range":
						// debounce
						return (newValue, oldValue) => {
							if (isFunction(this.debouncedFormatFunc)) {
								this.debouncedFormatFunc(value, oldValue);
								return;
							}

							// Fallback for cases where the debounced formatter isn't ready yet.
							switch (this.inputType) {
								case "number":
								case "range":
									this.formatNumberToModel(value, oldValue);
									break;
								case "date":
								case "datetime":
								case "datetime-local":
									this.formatDatetimeToModel(value, oldValue);
									break;
								default:
									this.updateModelValue(value, oldValue);
							}
						};
				}
			}

			return value;
		},
		formatDatetimeToModel(newValue, oldValue) {
			let defaultFormat = DATETIME_FORMATS[this.inputType];
			let m = fecha.parse(newValue, defaultFormat);
			if (m !== false) {
				if (this.schema.format) {
					newValue = fecha.format(m, this.schema.format);
				} else {
					newValue = m.valueOf();
				}
			}
			this.updateModelValue(newValue, oldValue);
		},
		formatNumberToModel(newValue, oldValue) {
			if (!isNumber(newValue)) {
				newValue = NaN;
			}
			this.updateModelValue(newValue, oldValue);
		},
		onInput($event) {
			let value = $event.target.value;
			switch (this.inputType) {
				case "number":
				case "range":
					if (isNumber(parseFloat($event.target.value))) {
						value = parseFloat($event.target.value);
					}
					break;
			}
			this.value = value;
		},
		onBlur() {
			if (isFunction(this.debouncedFormatFunc)) {
				this.debouncedFormatFunc.flush();
			}
			this.$emit("blur");
			this.$emit("state-focused", false);
			try {
				if (this.$el && typeof this.$el.dispatchEvent === "function") {
					this.$el.dispatchEvent(new window.Event("focusout", { bubbles: true }));
				}
			} catch (e) {
				// no-op
			}
		}
	},

	mounted() {
		switch (this.inputType) {
			case "number":
			case "range":
				this.debouncedFormatFunc = debounce(
					(newValue, oldValue) => {
						this.formatNumberToModel(newValue, oldValue);
					},
					parseInt(objGet(this.schema, "debounceFormatTimeout", 1000)),
					{
						trailing: true,
						leading: false
					}
				);
				break;
			case "date":
			case "datetime":
			case "datetime-local":
				// wait 1s before calling 'formatDatetimeToModel' to allow user to input data
				this.debouncedFormatFunc = debounce(
					(newValue, oldValue) => {
						this.formatDatetimeToModel(newValue, oldValue);
					},
					parseInt(objGet(this.schema, "debounceFormatTimeout", 1000)),
					{
						trailing: true,
						leading: false
					}
				);
				break;
		}
	},

	created() {
		if (this.inputType === "file") {
			console.warn("The 'file' type in input field is deprecated. Use 'file' field instead.");
		}
	}
};
</script>

<style lang="scss">
.vue-form-generator .field-input {
	.wrapper {
		width: 100%;
	}
	input[type="radio"] {
		width: 100%;
	}
	input[type="color"] {
		width: 60px;
	}
	input[type="range"] {
		padding: 0;
	}

	.helper {
		margin: auto 0.5em;
	}
}
</style>
