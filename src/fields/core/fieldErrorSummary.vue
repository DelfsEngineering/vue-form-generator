<template>
	<div class="vfg-error-summary" v-if="hasErrors" :role="role" :aria-live="live">
		<ul>
			<li v-for="(e, i) in formErrors" :key="i">
				<a :href="'#' + e.uid + '-errors'" @click.prevent="focus(e.uid)">{{ e.error }}</a>
			</li>
		</ul>
	</div>
</template>

<script>
import abstractField from "../abstractField";
import { get as objGet } from "lodash";

export default {
	name: "FieldErrorSummary",
	mixins: [abstractField],
	props: {
		role: { type: String, default: "alert" },
		live: { type: String, default: "polite" }
	},
	computed: {
		formErrors() {
			// Use form-level errors from the nearest FormGenerator (grandparent) when available
			if (this.$parent && this.$parent.$parent && Array.isArray(this.$parent.$parent.errors)) {
				return this.$parent.$parent.errors;
			}
			// Fallback: immediate parent (FormElement) errors if any
			if (this.$parent && Array.isArray(this.$parent.errors) && this.$parent.errors.length > 0) {
				return this.$parent.errors;
			}
			return [];
		},
		hasErrors() {
			return this.formErrors.length > 0;
		}
	},
	methods: {
		focus(uid) {
			if (!uid) return;
			const bus =
				this.eventBus ||
				objGet(this.$parent, "eventBus") ||
				objGet(this.$parent && this.$parent.$parent, "eventBus");
			if (bus && typeof bus.$emit === "function") {
				this.$nextTick(() => bus.$emit("focus-field", uid));
			}
		}
	}
};
</script>

<style scoped>
.vfg-error-summary {
	margin: 0 0 12px 0;
}
.vfg-error-summary ul {
	margin: 0;
	padding-left: 18px;
}
</style>

