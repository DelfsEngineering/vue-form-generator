import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";
import fieldSelect from "@/fields/core/fieldSelect.vue";
import fieldTextArea from "@/fields/core/fieldTextArea.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);
localVue.component("FieldSelect", fieldSelect);
localVue.component("FieldTextArea", fieldTextArea);

describe("Field-level legacy precedence", () => {
	const schema = {
		fields: [
			{
				type: "input",
				label: "Name",
				model: "name",
				legacy: false,
				fieldOptions: { inputType: "text" }
			},
			{
				type: "select",
				label: "Type",
				model: "type",
				values: ["Admin", "User"]
				// no field override
			},
			{
				type: "textArea",
				label: "Notes",
				model: "notes",
				legacy: true
			}
		]
	};

	const model = { name: "Alice", type: "User", notes: "" };

	it("field.legacy=false enables roles even if form legacy=true", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: {
				schema,
				model,
				legacy: true
			}
		});

		// input has override to minimal
		const input = wrapper.find("input");
		expect(input.attributes("data-vfg-role"), "input control role present").to.equal("control");

		// select has no override; form legacy=true -> no role
		const select = wrapper.find("select");
		expect(select.attributes("data-vfg-role"), "select control role absent").to.be.undefined;

		// textarea explicit legacy=true -> no role
		const textarea = wrapper.find("textarea");
		expect(textarea.attributes("data-vfg-role"), "textarea control role absent").to.be.undefined;
	});

	it("field.legacy=true disables roles even if form legacy=false", async () => {
		const schema2 = {
			fields: [
				{ type: "input", label: "Name", model: "name", fieldOptions: { inputType: "text" } },
				{ type: "select", label: "Type", model: "type", values: ["Admin", "User"], legacy: true },
				{ type: "textArea", label: "Notes", model: "notes" }
			]
		};

		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: {
				schema: schema2,
				model,
				legacy: false
			}
		});

		// form is minimal -> input should have role
		const input = wrapper.find("input");
		expect(input.attributes("data-vfg-role"), "input control role present").to.equal("control");

		// select has legacy=true -> should NOT have role
		const select = wrapper.find("select");
		expect(select.attributes("data-vfg-role"), "select control role absent").to.be.undefined;

		// textarea inherits minimal -> should have role
		const textarea = wrapper.find("textarea");
		expect(textarea.attributes("data-vfg-role"), "textarea control role present").to.equal("control");
	});
});
