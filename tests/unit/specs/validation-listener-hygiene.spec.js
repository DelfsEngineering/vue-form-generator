import { mount, createLocalVue } from "@vue/test-utils";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);

function countEventListeners(bus, eventName) {
	const listeners = bus._events && bus._events[eventName];
	if (!listeners) return 0;
	return Array.isArray(listeners) ? listeners.length : 1;
}

describe("Validation listener hygiene", () => {
	it("does not leak field-deregistering listeners across validate calls", async () => {
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: {
				schema: {
					fields: [
						{
							type: "input",
							label: "Name",
							model: "name",
							fieldOptions: { inputType: "text" }
						}
					]
				},
				model: { name: "Alice" },
				options: {}
			}
		});

		const initialCount = countEventListeners(wrapper.vm.eventBus, "field-deregistering");

		await wrapper.vm.validate();
		expect(countEventListeners(wrapper.vm.eventBus, "field-deregistering")).to.be.equal(initialCount);

		await wrapper.vm.validate();
		expect(countEventListeners(wrapper.vm.eventBus, "field-deregistering")).to.be.equal(initialCount);

		wrapper.destroy();
	});
});
