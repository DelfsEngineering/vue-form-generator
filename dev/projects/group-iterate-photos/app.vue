<template>
	<div class="container">
		<h1>Group Iterate - Photo Gallery Example</h1>
		<p class="lead">
			This example demonstrates the new <code>group-iterate</code> feature that renders a group once per array
			item.
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
				<h3>Actions</h3>
				<button class="btn btn-primary" @click="addPhoto">Add Photo</button>
				<button class="btn btn-danger" @click="removeLastPhoto" :disabled="model.photos.length === 0">
					Remove Last Photo
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
		return {
			model: {
				galleryTitle: "Summer Vacation 2026",
				photos: [
					{
						id: "p1",
						url: "https://picsum.photos/200/150?random=1",
						caption: "Sunset at the beach",
						rating: 5
					},
					{
						id: "p2",
						url: "https://picsum.photos/200/150?random=2",
						caption: "Mountain hike",
						rating: 4
					},
					{
						id: "p3",
						url: "https://picsum.photos/200/150?random=3",
						caption: "City lights",
						rating: 5
					}
				]
			},

			schema: {
				fields: [
					{
						type: "input",
						model: "galleryTitle",
						label: "Gallery Title",
						fieldOptions: {
							inputType: "text"
						},
						styleClasses: "col-md-12"
					},
					{
						type: "group",
						styleClasses: "col-md-12",
						fields: [
							{
								type: "group",
								// Dynamic styling: use index for first item special styling
								styleClasses: (item, index) => {
									let classes = "card card-body mb-3";
									if (index === 0) {
										// First photo: THICK blue border + background
										classes += " border-8 border-primary bg-primary-light";
										return "p-4 mb-4 border-8 border-solid rounded" + " border-blue-600 bg-blue-50";
									}
									return classes;
								},
								iterate: {
									items: "photos",
									key: "id"
								},
								fields: [
							{
								type: "input",
								model: "url",
								label: "Image URL",
								fieldOptions: {
									inputType: "text"
								},
								placeholder: "https://...",
								styleClasses: "col-md-12"
							},
							{
								type: "input",
								model: "caption",
								label: "Caption",
								fieldOptions: {
									inputType: "text"
								},
								placeholder: "Describe this photo...",
								styleClasses: "col-md-8"
							},
							{
								type: "radios",
								model: "rating",
								label: "Rating",
								values: [
									{ name: "★", value: 1 },
									{ name: "★★", value: 2 },
									{ name: "★★★", value: 3 },
									{ name: "★★★★", value: 4 },
									{ name: "★★★★★", value: 5 }
								],
								styleClasses: "col-md-4"
							},
							{
								type: "content",
								element: "hr",
								attrs: {
									style: "margin: 20px 0;"
								}
							}
						]
					}
						]
					}
				]
			},

			formOptions: {
				validateAfterLoad: false,
				validateAfterChanged: false
			},

			photoCounter: 4
		};
	},

	methods: {
		modelUpdated(newVal, schema) {
			console.log("Model updated:", newVal, schema);
		},

		addPhoto() {
			const newId = `p${this.photoCounter}`;
			this.model.photos.push({
				id: newId,
				url: `https://picsum.photos/200/150?random=${this.photoCounter}`,
				caption: `New photo ${this.photoCounter}`,
				rating: 3
			});
			this.photoCounter++;
		},

		removeLastPhoto() {
			if (this.model.photos.length > 0) {
				this.model.photos.pop();
			}
		}
	},

	mounted() {
		this.$nextTick(function () {
			window.app = this;
		});
	}
};
</script>

<style lang="scss" scoped>
@use "../../style.scss" as *;

.photo-card {
	border: 2px solid #e0e0e0;
	padding: 20px;
	margin-bottom: 20px;
	border-radius: 8px;
	background: #fafafa;
}

h3 {
	margin-top: 30px;
	margin-bottom: 15px;
}

.btn {
	margin-right: 10px;
	margin-bottom: 10px;
}
</style>
