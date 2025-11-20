import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);

describe("Wrapper flattening in minimal mode", () => {
	const schema = {
		fields: [
			{
				type: "input",
				label: "Name",
				model: "name",
				fieldOptions: { inputType: "text" }
			}
		]
	};

	it("applies display: contents to field-wrap and control wrapper when legacy=false", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" }, legacy: false }
		});

		const fieldWrap = wrapper.find(".field-wrap");
		expect(fieldWrap.exists()).to.equal(true);
		expect((fieldWrap.attributes("style") || "").replace(/\s+/g, " ")).to.contain("display: contents");

		const controlWrapper = wrapper.find(".field-input .wrapper");
		expect(controlWrapper.exists()).to.equal(true);
		expect((controlWrapper.attributes("style") || "").replace(/\s+/g, " ")).to.contain("display: contents");
		expect(controlWrapper.attributes("data-vfg-role")).to.equal("control-wrapper");
	});

	it("does not apply display: contents when legacy=true", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" }, legacy: true }
		});

		const fieldWrap = wrapper.find(".field-wrap");
		expect((fieldWrap.attributes("style") || "").toLowerCase()).to.not.contain("display: contents");

		const controlWrapper = wrapper.find(".field-input .wrapper");
		expect((controlWrapper.attributes("style") || "").toLowerCase()).to.not.contain("display: contents");
		expect(controlWrapper.attributes("data-vfg-role")).to.be.undefined;
	});
});
