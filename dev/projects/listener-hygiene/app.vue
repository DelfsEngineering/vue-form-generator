<template>
	<div class="demo">
		<h1>Listener Hygiene Demo</h1>
		<p>
			This page is for manual verification that repeated submit and validate flows do not accumulate transient
			event-bus listeners.
		</p>

		<div class="actions">
			<button id="manual-validate" @click="runValidate">Run validate()</button>
			<button id="toggle-extra" @click="showExtraField = !showExtraField">Toggle Extra Field</button>
			<button id="reset-counts" @click="resetCounts">Reset Counters</button>
		</div>

		<div class="stats">
			<div><strong>submitCount:</strong> <span id="submit-count">{{ submitCount }}</span></div>
			<div><strong>validationErrorCount:</strong> <span id="validation-error-count">{{ validationErrorCount }}</span></div>
			<div><strong>validatedEventCount:</strong> <span id="validated-count">{{ validatedEventCount }}</span></div>
			<div><strong>lastValidatedState:</strong> <span id="last-validated-state">{{ String(lastValidatedState) }}</span></div>
			<div>
				<strong>fields-validation-terminated listeners:</strong>
				<span id="terminated-listener-count">{{ listenerCounts.terminated }}</span>
			</div>
			<div>
				<strong>field-deregistering listeners:</strong>
				<span id="deregister-listener-count">{{ listenerCounts.deregistering }}</span>
			</div>
		</div>

		<vue-form-generator
			ref="form"
			:schema="schema"
			:model="model"
			:options="options"
			@validated="onValidated"
		></vue-form-generator>

		<div class="notes">
			<h2>Expected Behavior</h2>
			<ul>
				<li>Repeated invalid submit clicks should increment `validationErrorCount` by exactly 1 each time.</li>
				<li>Repeated valid submit clicks should increment `submitCount` by exactly 1 each time.</li>
				<li>`fields-validation-terminated` listener count should return to 0 after each submit cycle.</li>
				<li>`field-deregistering` listener count should stay stable across repeated `validate()` calls.</li>
			</ul>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			model: {
				name: ""
			},
			showExtraField: true,
			submitCount: 0,
			validationErrorCount: 0,
			validatedEventCount: 0,
			lastValidatedState: null,
			listenerCounts: {
				terminated: 0,
				deregistering: 0
			},
			options: {}
		};
	},
	computed: {
		schema() {
			const fields = [
				{
					type: "input",
					label: "Name",
					model: "name",
					required: true,
					validator: "required",
					fieldOptions: {
						inputType: "text"
					}
				}
			];

			if (this.showExtraField) {
				fields.push({
					type: "input",
					label: "Extra",
					model: "extra",
					fieldOptions: {
						inputType: "text"
					}
				});
			}

			fields.push({
				type: "submit",
				fieldOptions: {
					buttonText: "Submit",
					validateBeforeSubmit: true,
					onSubmit: () => {
						this.submitCount++;
						this.refreshListenerCounts();
					},
					onValidationError: () => {
						this.validationErrorCount++;
						this.refreshListenerCounts();
					}
				}
			});

			return { fields };
		}
	},
	methods: {
		countEventListeners(eventName) {
			const bus = this.$refs.form && this.$refs.form.eventBus;
			const listeners = bus && bus._events ? bus._events[eventName] : null;
			if (!listeners) return 0;
			return Array.isArray(listeners) ? listeners.length : 1;
		},
		refreshListenerCounts() {
			this.$nextTick(() => {
				this.listenerCounts = {
					terminated: this.countEventListeners("fields-validation-terminated"),
					deregistering: this.countEventListeners("field-deregistering")
				};
			});
		},
		runValidate() {
			this.$refs.form
				.validate()
				.then(() => {
					this.refreshListenerCounts();
				})
				.catch(() => {
					this.refreshListenerCounts();
				});
		},
		onValidated(isValid) {
			this.validatedEventCount++;
			this.lastValidatedState = isValid;
			this.refreshListenerCounts();
		},
		resetCounts() {
			this.submitCount = 0;
			this.validationErrorCount = 0;
			this.validatedEventCount = 0;
			this.lastValidatedState = null;
			this.refreshListenerCounts();
		}
	},
	mounted() {
		window.listenerHygieneApp = this;
		this.refreshListenerCounts();
	}
};
</script>

<style lang="scss">
.demo {
	max-width: 900px;
	margin: 20px auto;
	font-family: sans-serif;
}

.actions {
	display: flex;
	gap: 12px;
	margin-bottom: 16px;
}

.actions button {
	padding: 8px 12px;
}

.stats {
	display: grid;
	grid-template-columns: repeat(2, minmax(240px, 1fr));
	gap: 8px 16px;
	margin: 16px 0 24px;
	padding: 16px;
	background: #f7f7f7;
	border: 1px solid #ddd;
}

.notes {
	margin-top: 24px;
	padding: 16px;
	border: 1px solid #ddd;
	background: #fcfcfc;
}
</style>
