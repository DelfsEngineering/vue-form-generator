<template>
	<textarea
		class="form-control"
		v-model="value"
		:id="fieldId"
		:class="fieldClasses"
		:disabled="disabled"
		:maxlength="fieldOptions.max"
		:minlength="fieldOptions.min"
		:placeholder="placeholder"
		:required="required"
		:readonly="readonly"
		:rows="fieldOptions.rows || 2"
		:name="inputName"
		v-attributes="'input'"
		v-bind="controlAttrs"
	></textarea>
</template>

<script>
import abstractField from "../abstractField";
import { get as objGet } from "lodash";

export default {
	name: "FieldTextArea",
	mixins: [abstractField],
	computed: {
		ariaDescribedBy() {
			return `${this.fieldId}-hint ${this.fieldId}-errors`;
		},
		controlAttrs() {
			const attrs = { "aria-describedby": this.ariaDescribedBy };
			if (this.isMinimalMode()) {
				attrs["data-vfg-role"] = "control";
			}
			return attrs;
		}
	},
	methods: {
		isMinimalMode() {
			const fieldLegacy = objGet(this.schema || {}, "legacy");
			const resolvedLegacy =
				typeof fieldLegacy !== "undefined" ? fieldLegacy : objGet(this.formOptions || {}, "legacy", true);
			return resolvedLegacy === false;
		}
	}
};
</script>
