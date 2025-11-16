import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);

describe("Minimal mode roles hooks", () => {
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

	const model = { name: "Alice" };

	it("emits data-vfg-role hooks when legacy=false", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: {
				schema,
				model,
				legacy: false
			}
		});

		const el = wrapper.find('[data-vfg-role="element"]');
		expect(el.exists(), "element role should be present").to.be.true;

		const ctrl = wrapper.find('[data-vfg-role="control"]');
		expect(ctrl.exists(), "control role should be present").to.be.true;
	});

	it("does not emit data-vfg-role hooks when legacy=true (default)", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: {
				schema,
				model
			}
		});

		expect(wrapper.find('[data-vfg-role="element"]').exists()).to.be.false;
		expect(wrapper.find('[data-vfg-role="control"]').exists()).to.be.false;
	});
});
