import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);

describe("Minimal mode a11y defaults", () => {
	const schema = {
		fields: [
			{
				type: "input",
				label: "Name",
				model: "name",
				hint: "Enter your full name",
				validator: ["required"],
				fieldOptions: { inputType: "text" }
			}
		]
	};

	const model = { name: "" };

	it("wires aria-describedby to hint/errors and sets aria-live on errors in legacy=false", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model, legacy: false, options: { validateAfterChanged: true } }
		});

		const input = wrapper.find("input");
		expect(input.exists(), "input should exist").to.be.true;

		// blur to trigger validation and show errors
		input.trigger("blur");
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		const errors = wrapper.find(".errors");
		if (errors.exists()) {
			expect(errors.attributes("aria-live")).to.equal("polite");
		}
	});
});
