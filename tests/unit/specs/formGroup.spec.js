import { expect } from "chai";
import { mount, createLocalVue } from "@vue/test-utils";
import formGroup from "@/formGroup.vue";
import formElement from "@/formElement.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();

// Parent wrapper to provide named scoped slots for FormGroup
const GroupWrapper = {
	components: { FormGroup: formGroup },
	props: {
		fields: { type: Array, default: () => [] },
		group: { type: Object, default: () => ({}) },
		model: { type: Object, default: () => ({}) },
		options: { type: Object, default: () => ({}) },
		errors: { type: Array, default: () => [] },
		eventBus: { type: Object, default: () => ({ $on: () => {}, $off: () => {} }) },
		tag: { type: String, default: "fieldset" }
	},
	template: `
		<form-group
			:fields="fields"
			:group="group"
			:model="model"
			:options="options"
			:errors="errors"
			:event-bus="eventBus"
			:tag="tag"
		>
			<template slot="group-legend" slot-scope="slotProps">
				<legend v-if="slotProps.groupLegend">{{ slotProps.groupLegend }}</legend>
			</template>
			<template slot="element" slot-scope="slotProps">
				<div class="form-group"></div>
			</template>
		</form-group>
	`
};

// Register components that formGroup might need
localVue.component("FormElement", formElement);
localVue.component("FieldInput", fieldInput);

describe("formGroup.vue", () => {
	let wrapper;
	const createWrapper = (propsData = {}) => {
		return mount(GroupWrapper, {
			localVue,
			propsData: {
				fields: [],
				group: {},
				model: {},
				options: {},
				errors: [],
				eventBus: { $on: () => {}, $off: () => {} },
				...propsData
			}
		});
	};

	beforeEach(() => {
		wrapper = createWrapper();
	});

	afterEach(() => {
		wrapper.destroy();
	});

	describe("rendering", () => {
		it("should render a fieldset element", () => {
			expect(wrapper.find("fieldset").exists()).to.be.true;
		});

		it("should render legend if group has a legend property", () => {
			wrapper = createWrapper({
				group: { legend: "Test Legend" }
			});
			const legend = wrapper.find("legend");
			expect(legend.exists()).to.be.true;
			expect(legend.text()).to.equal("Test Legend");
		});

		it("should not render legend if group has no legend property", () => {
			expect(wrapper.find("legend").exists()).to.be.false;
		});
	});

	describe("props", () => {
		it("should handle empty fields array", () => {
			wrapper = createWrapper({ fields: [] });
			expect(wrapper.findAll(".form-group").length).to.equal(0);
		});

		it("should render multiple fields", () => {
			wrapper = createWrapper({
				fields: [
					{ type: "input", model: "name" },
					{ type: "input", model: "email" }
				]
			});
			expect(wrapper.findAll(".form-group").length).to.equal(2);
		});
	});

	describe("visibility", () => {
		it("should be visible by default", () => {
			expect(wrapper.isVisible()).to.be.true;
		});

		it("should respect visible property when false", () => {
			wrapper = createWrapper({
				fields: [
					{ type: "input", model: "name", visible: false }
				]
			});
			expect(wrapper.find(".form-group").exists()).to.be.false;
		});

		it("should respect visible property when true", () => {
			wrapper = createWrapper({
				fields: [
					{ type: "input", model: "name", visible: true }
				]
			});
			expect(wrapper.find(".form-group").exists()).to.be.true;
		});

		it("should handle visible as a function", () => {
			wrapper = createWrapper({
				fields: [
					{ type: "input", model: "name", visible: (model) => model.showField }
				],
				model: { showField: false }
			});
			expect(wrapper.find(".form-group").exists()).to.be.false;
		});
	});

	describe("styling", () => {
		it("should apply custom class from group.styleClasses", () => {
			wrapper = createWrapper({
				group: { styleClasses: "custom-class" }
			});
			expect(wrapper.find("fieldset").classes()).to.include("custom-class");
		});

		it("should handle multiple style classes", () => {
			wrapper = createWrapper({
				group: { styleClasses: ["class1", "class2"] }
			});
			expect(wrapper.find("fieldset").classes()).to.include.members(["class1", "class2"]);
		});
	});

	describe("nested groups", () => {
		it("should handle nested form groups", () => {
			wrapper = createWrapper({
				fields: [
					{
						type: "group",
						legend: "Nested Group",
						fields: [{ type: "input", model: "nested.field" }]
					}
				]
			});
			expect(wrapper.findAll("fieldset").length).to.be.gt(1);
		});
	});
});
