import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldSelect from "@/fields/core/fieldSelect.vue";
import fieldTextArea from "@/fields/core/fieldTextArea.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();
localVue.component("FieldSelect", fieldSelect);
localVue.component("FieldTextArea", fieldTextArea);
localVue.component("FieldInput", fieldInput);

describe("Select/Textarea control roles in minimal mode", () => {
	const schema = {
		fields: [
			{ type: "select", label: "Type", model: "type", values: ["A", "B"] },
			{ type: "textArea", label: "Notes", model: "notes" }
		]
	};

	it("adds data-vfg-role=control when legacy=false", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { type: "A", notes: "" }, legacy: false }
		});

		const select = wrapper.find("select");
		expect(select.exists()).to.equal(true);
		expect(select.attributes("data-vfg-role")).to.equal("control");

		const textarea = wrapper.find("textarea");
		expect(textarea.exists()).to.equal(true);
		expect(textarea.attributes("data-vfg-role")).to.equal("control");
	});

	it("omits role when legacy=true", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { type: "A", notes: "" }, legacy: true }
		});

		const select = wrapper.find("select");
		expect(select.attributes("data-vfg-role")).to.be.undefined;

		const textarea = wrapper.find("textarea");
		expect(textarea.attributes("data-vfg-role")).to.be.undefined;
	});
});
