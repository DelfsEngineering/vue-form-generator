import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";
import fieldErrorSummary from "@/fields/core/fieldErrorSummary.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);
localVue.component("FieldErrorSummary", fieldErrorSummary);

describe("Error summary (minimal mode)", () => {
	const baseInput = {
		type: "input",
		label: "Name",
		model: "name",
		required: true,
		validator: ["required"],
		fieldOptions: { inputType: "text" }
	};

	it("renders from schema element and links to field errors", async () => {
		const schema = { fields: [{ type: "error-summary" }, baseInput] };
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" }, legacy: false, options: { validateAfterChanged: true } }
		});

		await wrapper.vm.validate().catch(() => {});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		const link = wrapper.find('.vfg-error-summary a[href$="-errors"]');
		expect(link.exists()).to.equal(true);
	});

	it("renders when placed after fields", async () => {
		const schema = { fields: [baseInput, { type: "error-summary" }] };
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" }, legacy: false, options: { validateAfterChanged: true } }
		});

		await wrapper.vm.validate().catch(() => {});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		expect(wrapper.findAll(".vfg-error-summary").length).to.equal(1);
	});
});
