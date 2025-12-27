import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";
import fieldErrorSummary from "@/fields/core/fieldErrorSummary.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);
localVue.component("FieldErrorSummary", fieldErrorSummary);

describe("FieldErrorSummary element", () => {
	const schema = {
		fields: [
			{ type: "errorSummary" },
			{
				type: "input",
				label: "Name",
				model: "name",
				required: true,
				validator: ["required"],
				fieldOptions: { inputType: "text" }
			}
		]
	};

	it("renders summary and links after validation", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" }, legacy: false, options: { validateAfterChanged: true } }
		});

		await wrapper.vm.validate().catch(() => {});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		// Debug
		// eslint-disable-next-line no-console
		console.log("errors in field-level summary", wrapper.vm.errors);

		const summary = wrapper.find(".vfg-error-summary");
		expect(summary.exists()).to.equal(true);
		expect(summary.findAll('a[href$="-errors"]').length).to.be.greaterThan(0);
	});
});
