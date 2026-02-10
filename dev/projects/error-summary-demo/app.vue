<template>
	<div id="app">
		<h3>Error Summary Demo</h3>
		<vue-form-generator
			:legacy="legacyMode"
			:schema="schema"
			:model="model"
			:options="{ validateAfterChanged: false }"
			ref="vfg"
		/>
		<div style="margin-top:10px;">
			<button class="btn btn-default" @click="legacyMode = !legacyMode">Toggle Mode (legacy: {{ legacyMode }})</button>
			<button class="btn btn-primary" style="margin-left:10px;" @click="validate">Validate</button>
		</div>
	</div>
</template>

<script>
import VueFormGenerator from "../../../src/formGenerator.vue";

export default {
	name: "App",
	components: { VueFormGenerator },
	data() {
		return {
			legacyMode: false,
			model: { name: "", email: "", language: "", bio: "" },
			schema: {
				fields: [
					{ type: "errorSummary" },
					{ type: "input", label: "Name", model: "name", required: true, validator: ["required"], fieldOptions: { inputType: "text" } },
					{ type: "input", label: "Email", model: "email", validator: ["required", "email"], fieldOptions: { inputType: "email" } },
					{ type: "select", label: "Language", model: "language", values: ["English", "French", "German"], validator: ["required"] },
					{ type: "textArea", label: "Bio", model: "bio", fieldOptions: { rows: 3, max: 200 } }
				]
			}
		};
	},
	methods: {
		validate() {
			if (this.$refs.vfg && this.$refs.vfg.validate) {
				this.$refs.vfg.validate().catch(() => {});
			}
		}
	}
};
</script>


