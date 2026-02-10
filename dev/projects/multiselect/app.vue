<template>
	<div class="container">
		<h1>Multiselect</h1>
		<div class="row">
			<div class="col-sm-12">
				<vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>
			</div>
		</div>
		<div class="row">
			<div class="col-sm-12">
				<pre v-highlightjs="prettyModel"><code class="json"></code></pre>
			</div>
		</div>
	</div>
</template>

<script>
import mixinUtils from "../../mixins/utils.js";

import Vue from "vue";
import Multiselect from "vue-multiselect";
Vue.component("multiselect", Multiselect);

export default {
	mixins: [mixinUtils],

	data() {
		return {
			model: {
				skills: ["Javascript", "VueJS"],
				server: null
			},

			schema: {
				fields: [
					{
						type: "vueMultiSelect",
						label: "Skills",
						model: "skills",
						fieldOptions: {
							multiple: true
						},
						values: ["Javascript", "VueJS", "CSS3", "HTML5"]
					},
					{
						type: "vueMultiSelect",
						label: "Object Multiselect (open up)",
						model: "server",
						fieldOptions: {
							multiple: false,
							label: "name",
							trackBy: "id",
							openDirection: "top",
							tagPosition: "bottom",
							preserveSearch: true,
							preselectFirst: true,
							preventAutofocus: true,
							showNoOptions: true,
							showNoResults: true,
							tabindex: 2
						},
						values: [
							{
								description: "",
								gateway: "XML",
								hostAddress: "db.music.utoronto.ca",
								id: "E44AC001-5872-F542-9579-593AC84068EE",
								name: "UofT FOM"
							},
							{
								description: "old: 216.129.212.93",
								gateway: "XML",
								hostAddress: "216.220.58.118",
								id: "3BF60113-98DE-1040-B403-032AC930D031",
								name: "Floristware API"
							},
							{
								description: "",
								gateway: "DAPI",
								hostAddress: "deng3.bfoperations.com",
								id: "SV_A2BE39A6-0526-854F-B9C5-9FAD8FAC821D",
								name: "Deng3 - DAPI"
							},
							{
								description: "",
								gateway: "DAPI",
								hostAddress: "deng3.bfoperations.com",
								id: "SV_FA8F8038-F151-AA4D-A0A8-047264A91F93",
								name: "Deng3 - Eduardo Test"
							}
						]
					}
				]
			},

			formOptions: {}
		};
	},

	created() {
		window.app = this;
	}
};
</script>

<style lang="scss">
@use "../../style.scss" as *;
</style>
