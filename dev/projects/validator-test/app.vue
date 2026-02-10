<template>
	<div class="container">
		<h1>Validator Test</h1>
		<div class="row">
			<div class="col-sm-12">
				<vue-form-generator
					:schema="schema"
					:model="model"
					:options="formOptions"
					ref="vfg"
					@validated="onValidated"
				></vue-form-generator>
				<button @click="validateForm" class="btn btn-primary">Validate</button>
			</div>
		</div>
		<div class="row" v-if="validationErrors.length > 0">
			<div class="col-sm-12 errors">
				<h2>Errors:</h2>
				<ul>
					<li v-for="(error, index) in validationErrors" :key="index">
						<span v-if="error.field">{{ error.field.label }}:</span>
						{{ error.error }}
					</li>
				</ul>
			</div>
		</div>
		<div class="row">
			<div class="col-sm-12">
				<h2>Model</h2>
				<pre v-highlightjs="prettyModel"><code class="json"></code></pre>
			</div>
		</div>
	</div>
</template>

<script>
/* eslint no-console: 0 */
import mixinUtils from "../../mixins/utils.js";
import VueFormGenerator from "vue-form-generator";

const validators = VueFormGenerator.validators;

export default {
	mixins: [mixinUtils],

	data() {
		return {
			model: {
				name: null // Start with null to test required validator
			},
			validationErrors: [], // To store validation results

			schema: {
				fields: [
					{
						type: "input",
						model: "name",
						label: "Name (Required)",
						placeholder: "Enter your name",
						required: true,
						validator: validators.string,
						fieldOptions: {
							inputType: "text"
						}
					},
					{
						type: "input",
						model: "nameLast",
						label: "Name (Required) - Missing field options key",
						placeholder: "Enter your Last name",
						required: true,
						validator: validators.string
					}
				]
			},

			formOptions: {
				// validateAfterLoad: false, // Don't validate immediately
				validateAfterChanged: true
				// validationErrorClass: "error", // CSS class for validation errors
				// validationSuccessClass: "success" // CSS class for validation success
			}
		};
	},

	computed: {
		// Using prettyModel from mixinUtils
	},

	methods: {
		validateForm() {
			this.$refs.vfg
				.validate()
				.then((isValid) => {
					console.log("Validation result:", isValid);
					// The onValidated event below handles updating the error list
				})
				.catch((error) => {
					console.error("Validation promise rejected:", error);
					// Update the error list from the catch block if needed
					// The 'onValidated' event might still fire with isValid=false
					if (Array.isArray(error)) {
						this.validationErrors = error;
					} else {
						// Handle unexpected error types
						console.error("Unexpected validation error format:", error);
					}
				});
		},

		onValidated(isValid, errors) {
			console.log("VFG validated event:", isValid, errors);
			this.validationErrors = errors;
		}
	},

	mounted() {
		this.$nextTick(function () {
			window.app = this;
		});
	}
};
</script>

<style lang="scss">
@use "../../style.scss" as *;

.errors {
	margin-top: 15px;
	padding: 10px;
	background-color: #ffeeee;
	border: 1px solid #dd0000;
	border-radius: 5px;

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		color: #cc0000;
	}
}
</style>
