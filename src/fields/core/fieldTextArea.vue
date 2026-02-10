<template>
	<textarea
		ref="textarea"
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
	watch: {
		value() {
			// Keep textarea height in sync with content (opt-in).
			this.$nextTick(() => this.applyAutoExpand());
		}
	},
	methods: {
		isMinimalMode() {
			const fieldLegacy = objGet(this.schema || {}, "legacy");
			const resolvedLegacy =
				typeof fieldLegacy !== "undefined" ? fieldLegacy : objGet(this.formOptions || {}, "legacy", true);
			return resolvedLegacy === false;
		},
		applyAutoExpand() {
			if (objGet(this.fieldOptions, "autoExpand") !== true) return;

			const el = this.$refs.textarea;
			if (!el) return;

			// Allow shrinking by resetting to auto first.
			el.style.height = "auto";

			const scrollHeight = el.scrollHeight || 0;
			const maxHeight = objGet(this.fieldOptions, "maxHeight", null);

			if (typeof maxHeight === "number" && isFinite(maxHeight) && maxHeight > 0) {
				const clamped = Math.min(scrollHeight, maxHeight);
				el.style.height = `${clamped}px`;
				el.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
			} else {
				el.style.height = `${scrollHeight}px`;
				el.style.overflowY = "hidden";
			}
		}
	}
};
</script>
