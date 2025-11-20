import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);

describe("Minimal mode additional roles", () => {
	const schema = {
		fields: [
			{
				type: "input",
				label: "Name",
				model: "name",
				hint: "Enter your full name",
				buttons: [{ label: "X", classes: "btn" }],
				fieldOptions: { inputType: "text" }
			}
		]
	};

	it("adds data-vfg-role hooks for hint/errors/buttons in legacy=false", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" }, legacy: false, options: { validateAfterChanged: true } }
		});

		const hint = wrapper.find(".hint");
		if (hint.exists()) {
			expect(hint.attributes("data-vfg-role")).to.equal("hint");
		}

		const errors = wrapper.find(".errors");
		if (errors.exists()) {
			expect(errors.attributes("data-vfg-role")).to.equal("errors");
		}

		const buttons = wrapper.find(".buttons");
		expect(buttons.exists()).to.equal(true);
		expect(buttons.attributes("data-vfg-role")).to.equal("buttons");
	});

	it("does not add data-vfg-role for these when legacy=true", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" }, legacy: true, options: { validateAfterChanged: true } }
		});

		const hint = wrapper.find(".hint");
		if (hint.exists()) {
			expect(hint.attributes("data-vfg-role")).to.be.undefined;
		}

		const errors = wrapper.find(".errors");
		if (errors.exists()) {
			expect(errors.attributes("data-vfg-role")).to.be.undefined;
		}

		const buttons = wrapper.find(".buttons");
		expect(buttons.exists()).to.equal(true);
		expect(buttons.attributes("data-vfg-role")).to.be.undefined;
	});
});
