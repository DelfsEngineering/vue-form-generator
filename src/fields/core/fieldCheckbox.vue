<template>
	<input
		:id="fieldId"
		type="checkbox"
		v-model="value"
		:autocomplete="fieldOptions.autocomplete"
		:disabled="disabled"
		:name="inputName"
		:class="fieldClasses"
		:required="required"
		v-attributes="'input'"
	/>
</template>

<script>
import abstractField from "../abstractField";

export default {
	name: "FieldCheckbox",
	mixins: [abstractField]
};
</script>

<style lang="scss">
.vue-form-generator .field-checkbox input {
	margin-left: 12px;
}
</style>
