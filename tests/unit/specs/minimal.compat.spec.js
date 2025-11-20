import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);

describe("Compatibility class mirroring", () => {
	const schema = {
		fields: [
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

	it("mirrors legacy classes by default in minimal mode", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" }, legacy: false, options: { validateAfterChanged: true } }
		});

		await wrapper.vm.validate().catch(() => {});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		const errors = wrapper.find(".errors");
		if (errors.exists()) {
			expect(errors.classes()).to.include("help-block");
		}
	});

	it("omits mirrored legacy classes when disabled", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: {
				schema,
				model: { name: "" },
				legacy: false,
				options: { validateAfterChanged: true, compatibility: { classMirroring: false } }
			}
		});

		await wrapper.vm.validate().catch(() => {});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		const errors = wrapper.find(".errors");
		if (errors.exists()) {
			expect(errors.classes()).to.not.include("help-block");
		}
	});
});
