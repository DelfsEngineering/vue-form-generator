<template>
	<div class="container">
		<h1>Content Field Demo</h1>
		<p class="lead">Schema-Driven HTML without wrapper divs</p>

		<div class="row">
			<div class="col-sm-12">
				<vue-form-generator
					:schema="schema"
					:model="model"
					:options="formOptions"
					ref="form"
					@model-updated="modelUpdated"
					@validated="onValidated"
				></vue-form-generator>
			</div>
		</div>

		<div class="row mt-4">
			<div class="col-sm-12">
				<h3>Model Data</h3>
				<pre v-highlightjs="prettyModel"><code class="json"></code></pre>
			</div>
		</div>

		<div class="row mt-4">
			<div class="col-sm-12">
				<h3>Schema</h3>
				<pre v-highlightjs="prettySchema"><code class="json"></code></pre>
			</div>
		</div>
	</div>
</template>

<script>
/* eslint no-console: 0 */
import mixinUtils from "../../mixins/utils.js";

export default {
	mixins: [mixinUtils],

	data() {
		return {
			model: {
				name: "",
				email: "",
				password: "",
				acceptTerms: false
			},

			schema: {
				fields: [
					// Page Header
					{
						type: "content",
						element: "h1",
						text: "Create Your Account",
						attrs: {
							class: "mb-3 text-primary",
							id: "page-title"
						},
						id: "idbf_c_page_title"
					},

					// Subtitle
					{
						type: "content",
						element: "p",
						text: "Fill in your details below to get started. All fields are required.",
						attrs: {
							class: "text-muted mb-4"
						},
						id: "idbf_c_subtitle"
					},

					// Section Header
					{
						type: "content",
						element: "h2",
						text: "Personal Information",
						attrs: {
							class: "h4 mb-3 mt-4"
						}
					},

					// Name Field
					{
						type: "input",
						model: "name",
						label: "Full Name",
						required: true,
						validator: ["required"],
						hint: "Enter your first and last name",
						fieldOptions: {
							inputType: "text",
							placeholder: "John Doe"
						}
					},

					// Email Field
					{
						type: "input",
						model: "email",
						label: "Email Address",
						required: true,
						validator: ["required", "email"],
						hint: "We'll never share your email with anyone else",
						fieldOptions: {
							inputType: "email",
							placeholder: "john@example.com"
						}
					},

					// Divider
					{
						type: "content",
						element: "hr",
						attrs: {
							class: "my-4"
						}
					},

					// Security Section
					{
						type: "content",
						element: "h2",
						text: "Security",
						attrs: {
							class: "h4 mb-3"
						}
					},

					// Password Field
					{
						type: "input",
						model: "password",
						label: "Password",
						required: true,
						validator: ["required"],
						hint: "Must be at least 8 characters",
						fieldOptions: {
							inputType: "password",
							placeholder: "••••••••"
						}
					},

					// Info Box with Nested HTML
					{
						type: "content",
						element: "div",
						attrs: {
							class: "alert alert-info my-3",
							role: "alert"
						},
						children: [
							{
								element: "strong",
								text: "Security Tip: "
							},
							{
								element: "span",
								text: "Use a strong password that includes numbers, letters, and special characters."
							}
						]
					},

					// Another Divider
					{
						type: "content",
						element: "hr",
						attrs: {
							class: "my-4"
						}
					},

					// Terms Section
					{
						type: "content",
						element: "h2",
						text: "Terms & Conditions",
						attrs: {
							class: "h4 mb-3"
						}
					},

					// Checkbox
					{
						type: "checkbox",
						model: "acceptTerms",
						label: "I accept the terms and conditions",
						required: true,
						validator: ["required"]
					},

					// Terms Link with HTML
					{
						type: "content",
						element: "p",
						html: 'Read our <a href="#" class="text-primary">Terms of Service</a> and <a href="#" class="text-primary">Privacy Policy</a>.',
						attrs: {
							class: "text-muted small mt-2"
						}
					},

					// Submit Button
					{
						type: "submit",
						fieldOptions: {
							buttonText: "Create Account"
						}
					},

					// Footer Note
					{
						type: "content",
						element: "p",
						text: "Already have an account? Sign in here.",
						attrs: {
							class: "text-center text-muted mt-4"
						}
					}
				]
			},

			formOptions: {
				validateAfterLoad: false,
				validateAfterChanged: true,
				validationErrorClass: "error",
				validationSuccessClass: "valid"
			}
		};
	},

	computed: {
		prettySchema() {
			return JSON.stringify(this.schema, null, 2);
		}
	},

	methods: {
		onValidated(res, errors) {
			console.log("Form validated:", res, errors);
		},

		modelUpdated(newVal, schema) {
			console.log("Model updated:", newVal, schema);
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

// Custom styles for the demo
.alert {
	padding: 1rem;
	margin-bottom: 1rem;
	border: 1px solid transparent;
	border-radius: 0.25rem;
}

.alert-info {
	color: #0c5460;
	background-color: #d1ecf1;
	border-color: #bee5eb;
}

.text-primary {
	color: #007bff !important;
}

.text-muted {
	color: #6c757d !important;
}

.mt-2 {
	margin-top: 0.5rem !important;
}

.mt-3 {
	margin-top: 1rem !important;
}

.mt-4 {
	margin-top: 1.5rem !important;
}

.mb-3 {
	margin-bottom: 1rem !important;
}

.mb-4 {
	margin-bottom: 1.5rem !important;
}

.my-3 {
	margin-top: 1rem !important;
	margin-bottom: 1rem !important;
}

.my-4 {
	margin-top: 1.5rem !important;
	margin-bottom: 1.5rem !important;
}

.h4 {
	font-size: 1.5rem;
}

.lead {
	font-size: 1.25rem;
	font-weight: 300;
}

.small {
	font-size: 0.875em;
}

.text-center {
	text-align: center !important;
}
</style>


