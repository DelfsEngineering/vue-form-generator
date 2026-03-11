<template>
	<div class="input-group date">
		<input
			class="form-control"
			type="text"
			v-model="value"
			:autocomplete="fieldOptions.autocomplete"
			:disabled="disabled"
			:placeholder="placeholder"
			:readonly="readonly"
			:name="inputName"
			:id="fieldId"
		/>

		<span class="input-group-addon">
			<span class="glyphicon glyphicon-calendar"></span>
		</span>
	</div>
</template>

<script>
/* global $ */
import abstractField from "../abstractField";
import { defaults } from "lodash";
import dateFieldHelper from "../../utils/dateFieldHelper";

export default {
	name: "FieldDateTimePicker",
	mixins: [abstractField],

	methods: {
		...dateFieldHelper
	},

	mounted() {
		this.$nextTick(() => {
			if (window.$ && window.$.fn.datetimepicker) {
				let input = this.$el.querySelector(".form-control");
				$(this.$el)
					.datetimepicker(
						defaults(this.fieldOptions, {
							format: this.getDefaultInputFormat()
						})
					)
					.on("dp.change", () => {
						this.value = input.value;
					});
			} else {
				console.warn(
					"Bootstrap datetimepicker library is missing. Please download from https://eonasdan.github.io/bootstrap-datetimepicker/ and load the script and CSS in the HTML head section!"
				);
			}
		});
	},

	beforeDestroy() {
		if (window.$ && window.$.fn.datetimepicker) {
			$(this.$el).data("DateTimePicker").destroy();
		}
	}
};
</script>

<style scoped>
/* Prevent icon/addon from stretching when dateTimePicker is inside a flex container.
   The parent .field-wrap uses display: flex with align-items: stretch, causing the
   input-group to stretch. Without this, the addon stretches while the input stays normal. */
.input-group.date {
	align-self: flex-start;
	width: 100%;
}

.input-group.date .form-control {
	flex: 1;
	min-width: 0;
}

.input-group.date .input-group-addon {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
