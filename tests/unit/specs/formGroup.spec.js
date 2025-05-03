import { expect } from "chai";
import { mount, createLocalVue } from "@vue/test-utils";
import formGroup from "@/formGroup.vue";

const localVue = createLocalVue();

describe("formGroup.vue", () => {
	let wrapper;
	const createWrapper = (propsData = {}) => {
		return mount(formGroup, {
			localVue,
			propsData: {
				field: {},
				fields: [],
				model: {},
				eventBus: { $on: () => {}, $off: () => {} }, // Restore simple mock
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

		it("should render legend if field has a legend property", () => {
			wrapper = createWrapper({
				field: { legend: "Test Legend" }
			});
			const legend = wrapper.find("legend");
			expect(legend.exists()).to.be.true;
			expect(legend.text()).to.equal("Test Legend");
		});

		it("should not render legend if field has no legend property", () => {
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
				field: { visible: false }
			});
			expect(wrapper.isVisible()).to.be.false;
		});

		it("should respect visible property when true", () => {
			wrapper = createWrapper({
				field: { visible: true }
			});
			expect(wrapper.isVisible()).to.be.true;
		});

		it("should handle visible as a function", () => {
			wrapper = createWrapper({
				field: {
					visible: (model) => model.showField
				},
				model: { showField: false }
			});
			expect(wrapper.isVisible()).to.be.false;
		});
	});

	describe("styling", () => {
		it("should apply custom class from field.styleClasses", () => {
			wrapper = createWrapper({
				field: { styleClasses: "custom-class" }
			});
			expect(wrapper.classes()).to.include("custom-class");
		});

		it("should handle multiple style classes", () => {
			wrapper = createWrapper({
				field: { styleClasses: ["class1", "class2"] }
			});
			expect(wrapper.classes()).to.include.members(["class1", "class2"]);
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
