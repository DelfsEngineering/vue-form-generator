import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);

describe("State classes on .form-element", () => {
	const baseSchema = {
		fields: [
			{
				type: "input",
				label: "Name",
				model: "name",
				fieldOptions: { inputType: "text" }
			}
		]
	};

	it("adds .empty when empty and .filled when value present", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema: baseSchema, model: { name: "" }, legacy: false }
		});

		const el = wrapper.find(".form-element");
		expect(el.classes()).to.include("empty");
		expect(el.classes()).to.not.include("filled");

		wrapper.vm.model.name = "Alice";
		await wrapper.vm.$nextTick();

		expect(el.classes()).to.include("filled");
		expect(el.classes()).to.not.include("empty");
	});

	it("toggles .focused on input focus/blur", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema: baseSchema, model: { name: "" }, legacy: false }
		});

		const el = wrapper.find(".form-element");

		expect(el.classes()).to.not.include("focused");
		// Trigger a bubbling focusin which our container listens to
		el.trigger("focusin");
		await wrapper.vm.$nextTick();
		expect(el.classes()).to.include("focused");

		el.trigger("focusout");
		await wrapper.vm.$nextTick();
		expect(el.classes()).to.not.include("focused");
	});
});
