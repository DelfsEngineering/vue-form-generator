<template>
	<div
		class="wrapper"
		v-attributes="'wrapper'"
		:style="flattenControlWrapper ? 'display: contents' : null"
		v-bind="controlWrapperAttrs"
	>
		<input
			class="form-control"
			:id="fieldId"
			type="file"
			:name="inputName"
			@change="onChange"
			:accept="fieldOptions.accept"
			:multiple="fieldOptions.multiple"
			:placeholder="placeholder"
			:readonly="readonly"
			:required="schema.required"
			:disabled="disabled"
			v-attributes="'input'"
		/>
	</div>
</template>

<script>
import abstractField from "../abstractField";
import { isFunction, get as objGet } from "lodash";

export default {
	name: "FieldUpload",
	mixins: [abstractField],
	computed: {
		flattenControlWrapper() {
			const keepWrapper =
				objGet(this.schema || {}, "keepWrapper", false) ||
				objGet(this.schema || {}, "wrapperMode", null) === "legacy";
			const legacy = objGet(this.formOptions || {}, "legacy", true);
			return legacy === false && !keepWrapper;
		},
		controlWrapperAttrs() {
			if (this.flattenControlWrapper) {
				return { "data-vfg-role": "control-wrapper" };
			}
			return {};
		}
	},
	methods: {
		onChange($event) {
			if (isFunction(this.fieldOptions.onChanged)) {
				// Schema has defined onChange method.
				this.fieldOptions.onChanged.call(this, this.model, this.schema, $event, this);
			}
		}
	}
};
</script>

<style lang="scss">
.vue-form-generator .field-input {
	.wrapper {
		width: 100%;
	}
	.helper {
		margin: auto 0.5em;
	}
}
</style>
