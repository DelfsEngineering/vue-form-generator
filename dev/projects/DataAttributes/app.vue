<template>
	<div class="container">
		<h1>Grouping</h1>
		<div class="row">
			<div class="col-sm-12">
				<vue-form-generator
					:schema="schema"
					:model="model"
					:options="formOptions"
					tag="section"
				></vue-form-generator>
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

export default {
	mixins: [mixinUtils],

	data() {
		return {
			model: {
				one: {
					two: "Data Attributes 1"
				},
				name: "Brian Blessed",
				email: "brian@hawkman.mongo",
				others: {
					more: "More",
					things: "Things"
				},
				single: "blah",
				subname: ""
			},

			schema: {
				fields: [
					{
						type: "group",
						attributes: {
							formGroup: {
								thisisformgroup123: "test-inner"
							},
							"test-without-formGroup": "test"
						},
						legend: "v-attributes",
						tag: "div",
						fields: [
							{
								type: "group",
								attributes: {
									"test-formGroup": "test-inner"
								},
								legend: "INNER GROUP",
								tag: "div",

								fields: [
									{
										type: "input",
										model: "one.two",
										label: "attributes here",
										attributes: {
											wrapper: {
												"data-gem": "data-thisIsGem"
											},
											input: {
												"data-stone": "data-thisIsStone"
											},
											formElement: {
												"data-rock": "my-thisIsRock",
												"data-rockSecond": "rockSecond"
											}
										},
										fieldOptions: {
											inputType: "text"
										},
										required: true,
										validator: ["required"]
									}
								]
							},
							{
								type: "input",
								model: "one.two",
								label: "attributes here",
								attributes: {
									wrapper: {
										"data-gem": "data-thisIsGem"
									},
									input: {
										"data-stone": "data-thisIsStone"
									},
									formElement: {
										"data-rock": "my-thisIsRock",
										"data-rockSecond": "rockSecond"
									}
								},
								fieldOptions: {
									inputType: "text"
								},
								required: true,
								validator: ["required"]
							},
							{
								type: "input",
								model: "name",
								label: "Name",
								attributes: {
									formElement: {
										"data-christina2": "zz"
									},
									wrapper: {
										"data-christina": "data-field-wrapper"
									},
									input: {
										"data-christina1": "data-input"
									}
								},
								fieldOptions: {
									inputType: "text"
								},
								required: true,
								validator: ["required"]
							},
							{
								type: "input",
								model: "name",
								label: "Name",
								fieldOptions: {
									inputType: "text"
								},
								required: true,
								validator: ["required"]
							}
						]
					}
				]
			},

			formOptions: {
				validateAfterLoad: true,
				validateAfterChanged: true,
				fieldIdPrefix: "frm1-"
			}
		};
	},

	created() {
		window.app = this;
	}
};
</script>

<style lang="scss">
@use "../../style.scss" as *;
.field-group {
	border: 2px solid #bbb;
	padding: 8px;
	border-radius: 4px;
}
.subgroup {
	border-color: goldenrod;
	legend {
		color: #00268d;
	}
}
</style>
