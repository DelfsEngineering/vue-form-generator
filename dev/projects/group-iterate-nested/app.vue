<template>
	<div class="container">
		<h1>Group Iterate - Nested Example</h1>
		<p class="lead">
			This example demonstrates nested <code>group-iterate</code> - states containing cities, where each city
			has editable fields.
		</p>

		<div class="row">
			<div class="col-sm-12">
				<vue-form-generator
					:schema="schema"
					:model="model"
					:options="formOptions"
					ref="form"
					@model-updated="modelUpdated"
				></vue-form-generator>
			</div>
		</div>

		<div class="row">
			<div class="col-sm-12">
				<h3>Model Data</h3>
				<pre v-highlightjs="prettyModel"><code class="json"></code></pre>
			</div>
		</div>

		<div class="row">
			<div class="col-sm-12">
				<h3>Color Legend</h3>
				<div style="display: flex; gap: 20px; margin-bottom: 20px;">
					<div>
						<strong>States:</strong>
						<span class="inline-block px-3 py-1 bg-blue-100 border-2 border-blue-400 rounded ml-2">
							≥3 cities
						</span>
						<span class="inline-block px-3 py-1 bg-blue-50 border-2 border-blue-200 rounded ml-2">
							<3 cities
						</span>
					</div>
					<div>
						<strong>Cities:</strong>
						<span class="inline-block px-3 py-1 bg-green-100 border-2 border-green-400 rounded ml-2">
							Capital
						</span>
						<span class="inline-block px-3 py-1 bg-yellow-100 border-2 border-yellow-400 rounded ml-2">
							>1M pop
						</span>
						<span class="inline-block px-3 py-1 bg-orange-50 border-2 border-orange-200 rounded ml-2">
							Other
						</span>
					</div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-sm-12">
				<h3>Actions</h3>
				<button class="btn btn-primary" @click="addState">Add State</button>
				<button class="btn btn-danger" @click="removeLastState" :disabled="model.states.length === 0">
					Remove Last State
				</button>
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
		const vm = this;
		return {
			model: {
				country: "USA",
				showOnlyLargeCities: false,
				showPopulation: true,
				sortStatesBy: "default", // default, name, code
				sortCitiesBy: "default", // default, name, population
				states: [
					{
						id: "s1",
						name: "California",
						code: "CA",
						cities: [
							{
								id: "c1",
								name: "San Francisco",
								population: 873965,
								isCapital: false
							},
							{
								id: "c2",
								name: "Los Angeles",
								population: 3979576,
								isCapital: false
							},
							{
								id: "c3",
								name: "Sacramento",
								population: 524943,
								isCapital: true
							}
						]
					},
					{
						id: "s2",
						name: "New York",
						code: "NY",
						cities: [
							{
								id: "c4",
								name: "New York City",
								population: 8336817,
								isCapital: false
							},
							{
								id: "c5",
								name: "Buffalo",
								population: 278349,
								isCapital: false
							},
							{
								id: "c6",
								name: "Albany",
								population: 99224,
								isCapital: true
							}
						]
					}
				]
			},

			formOptions: {
				validateAfterLoad: false,
				validateAfterChanged: false
			},

			stateCounter: 3,
			cityCounter: 7
		};
	},

	computed: {
		prettyModel() {
			return JSON.stringify(this.model, null, 2);
		},

		schema() {
			const vm = this;
			return {
				fields: [
					{
						type: "input",
						model: "country",
						label: "Country",
						fieldOptions: {
							inputType: "text"
						},
						styleClasses: "col-md-12"
					},
					{
						type: "content",
						element: "div",
						attrs: {
							class: "well well-sm",
							style: "margin: 20px 0; padding: 15px;"
						}
					},
					{
						type: "radios",
						model: "showOnlyLargeCities",
						label: "City Filter",
						values: [
							{ name: "Show All Cities", value: false },
							{ name: "Show Only Large Cities (>500k)", value: true }
						],
						styleClasses: "col-md-6"
					},
					{
						type: "radios",
						model: "showPopulation",
						label: "Display Options",
						values: [
							{ name: "Show Population", value: true },
							{ name: "Hide Population", value: false }
						],
						styleClasses: "col-md-6"
					},
					{
						type: "select",
						model: "sortStatesBy",
						label: "Sort States By",
						values: [
							{ id: "default", name: "Default Order" },
							{ id: "name", name: "Name (A-Z)" },
							{ id: "code", name: "Code (A-Z)" }
						],
						styleClasses: "col-md-6"
					},
					{
						type: "select",
						model: "sortCitiesBy",
						label: "Sort Cities By",
						values: [
							{ id: "default", name: "Default Order" },
							{ id: "name", name: "Name (A-Z)" },
							{ id: "population", name: "Population (High to Low)" }
						],
						styleClasses: "col-md-6"
					},
					{
						type: "content",
						element: "hr",
						attrs: {
							style: "margin: 20px 0;"
						}
					},
					{
						type: "group",
						styleClasses: "col-md-12",
						fields: [
							{
								type: "group",
								iterate: {
									wrapperClass: "flex flex-col gap-4", // Wrapper styling (space between cards)
							// Sort states based on sortStatesBy setting
							items: (rootModel) => {
								const states = [...rootModel.states]; // Clone to avoid mutating original
								const sortBy = vm.model.sortStatesBy;

								if (sortBy === "name") {
									return states.sort((a, b) => a.name.localeCompare(b.name));
								} else if (sortBy === "code") {
									return states.sort((a, b) => a.code.localeCompare(b.code));
								}
								// default - return original order
								return states;
							},
							key: "id"
						},
						legend: "State",
						// styleClasses with index - demonstrates position-based styling
						styleClasses: (stateModel, index) => {
							const cityCount = stateModel.cities ? stateModel.cities.length : 0;
							let classes = "p-5 mb-4 rounded-lg";

							// Position-based: Highlight first state with THICK purple border
							if (index === 0) {
								classes += " border-8 border-purple-600 bg-purple-50"; // First state: thick purple
							}
							// Content-based: Color by city count
							else if (cityCount >= 3) {
								classes += " border-2 bg-blue-100 border-blue-400"; // Many cities
							} else {
								classes += " border-2 bg-blue-50 border-blue-200"; // Few cities
							}

							return classes;
						},
						fields: [
							{
								type: "input",
								model: "name",
								label: "State Name",
								fieldOptions: {
									inputType: "text"
								},
								styleClasses: "col-md-8"
							},
							{
								type: "input",
								model: "code",
								label: "State Code",
								fieldOptions: {
									inputType: "text"
								},
								placeholder: "e.g., CA",
								styleClasses: "col-md-4"
							},
							{
								type: "content",
								element: "h4",
								text: "Cities",
								attrs: {
									style: "margin-top: 20px; margin-bottom: 10px; color: #333;"
								}
							},
							{
								type: "group",
								iterate: {
									wrapperClass: "flex flex-col gap-3", // Wrapper styling (space between cities)
									// Sort cities based on root model settings
									items: (stateModel) => {
										// Clone to avoid mutating original
										let cities = [...stateModel.cities];

										// SORT: Apply sorting
										const sortBy = vm.model.sortCitiesBy;
										if (sortBy === "name") {
											cities.sort((a, b) => a.name.localeCompare(b.name));
										} else if (sortBy === "population") {
											cities.sort((a, b) => b.population - a.population); // High to low
										}
										// default - keep original order

										return cities;
									},
									key: "id"
								},
								// PER-ITEM visible: Filter by population (demonstrates per-item visibility)
								visible: (city) => {
									// If filter is enabled, only show large cities
									if (vm.model.showOnlyLargeCities) {
										return city.population > 500000;
									}
									return true; // Show all
								},
								// styleClasses with index - demonstrates item + position based styling
								styleClasses: (cityModel, index) => {
									let classes = "p-4 rounded";

									// Position-based: First city in each state gets THICK border
									if (index === 0) {
										classes += " border-8 border-indigo-600"; // Extra thick for first city
									} else {
										classes += " border-2"; // Normal border for others
									}

									// Content-based: Capital cities
									if (cityModel.isCapital) {
										classes += " bg-green-100 border-green-400";
									}
									// Content-based: Large cities (>1M)
									else if (cityModel.population > 1000000) {
										classes += " bg-yellow-100 border-yellow-400";
									}
									// Content-based: Regular cities
									else {
										classes += " bg-orange-50 border-orange-200";
									}

									return classes;
								},
								fields: [
									{
										type: "input",
										model: "name",
										label: "City Name",
										fieldOptions: {
											inputType: "text"
										},
										// Dynamic styleClasses based on city properties
										styleClasses: (model, field, schema) => {
											let classes = "col-md-4";
											// Highlight capital cities
											if (model.isCapital) {
												classes += " highlight-capital";
											}
											return classes;
										}
									},
									{
										type: "input",
										model: "population",
										label: "Population",
										fieldOptions: {
											inputType: "number"
										},
										// Dynamic classes based on population size
										styleClasses: (model, field, schema) => {
											let classes = "col-md-4";
											// Highlight large cities (>1 million)
											if (model.population > 1000000) {
												classes += " highlight-large";
											}
											return classes;
										},
										// Conditionally show population field based on root model setting
										visible: (cityModel) => {
											// Access root model through closure
											return vm.model.showPopulation;
										}
									},
									{
										type: "radios",
										model: "isCapital",
										label: "Capital City?",
										values: [
											{ name: "Yes", value: true },
											{ name: "No", value: false }
										],
										// Dynamic classes on the radio field wrapper
										styleClasses: (model) => {
											let classes = "col-md-4";
											if (model.isCapital) {
												classes += " text-success";
											}
											return classes;
										}
									}
								]
							}
						]
					}
						]
					}
				]
			};
		}
	},

	methods: {
		modelUpdated(newVal, schema) {
			console.log("Model updated:", newVal);
		},

		addState() {
			const newState = {
				id: `s${this.stateCounter++}`,
				name: `New State ${this.stateCounter}`,
				code: `S${this.stateCounter}`,
				cities: [
					{
						id: `c${this.cityCounter++}`,
						name: "New City",
						population: 100000,
						isCapital: false
					}
				]
			};
			this.model.states.push(newState);
		},

		removeLastState() {
			if (this.model.states.length > 0) {
				this.model.states.pop();
			}
		}
	}
};
</script>

<style scoped>
.container {
	padding: 20px;
}

/* Dynamic styling based on field values - using minimal custom CSS */
.highlight-large {
	background-color: #fff9c4 !important;
	border-left: 4px solid #fbc02d !important;
}

.highlight-capital {
	background-color: #e8f5e9 !important;
	border-left: 4px solid #4caf50 !important;
}

.text-warning {
	color: #ff9800;
	font-weight: bold;
}

.text-success {
	color: #4caf50;
	font-weight: bold;
}
</style>
