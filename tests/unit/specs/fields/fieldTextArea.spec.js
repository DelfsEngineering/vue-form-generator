import { mount, createLocalVue } from "@vue/test-utils";

import Vue from "vue";
import FieldTextArea from "@/fields/core/fieldTextArea.vue";

const localVue = createLocalVue();
let wrapper;

function createField(data, methods) {
	const _wrapper = mount(FieldTextArea, {
		localVue,
		attachToDocument: true,
		mocks: {
			$parent: {
				getValueFromOption: global.getValueFromOption
			}
		},
		propsData: {
			eventBus: new Vue(),
			...data
		}
	});
	if (methods) {
		_wrapper.setMethods(methods);
	}
	wrapper = _wrapper;

	return _wrapper;
}

describe("fieldTextArea.vue", () => {
	describe("check template", () => {
		let schema = {
			type: "textarea",
			model: "desc",
			label: "Description",
			disabled: false,
			placeholder: "",
			readonly: false,
			inputName: "",
			fieldClasses: ["applied-class", "another-class"],
			fieldOptions: {
				max: 500
			}
		};
		let model = { desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." };
		let input;

		before(() => {
			createField({ schema, model });
			input = wrapper.find("textarea");
		});

		it("should contain a textarea element", () => {
			expect(wrapper.exists()).to.be.true;
			expect(input.is("textarea")).to.be.true;
			expect(input.classes()).to.include("form-control");
			expect(input.attributes().rows).to.be.equal("2"); // default value is 2
			expect(input.attributes().maxlength).to.be.equal("500");
		});

		it("should change rows to 4", async () => {
			schema.fieldOptions.rows = 4;
			wrapper.setProps({ schema: { ...schema } });
			await wrapper.vm.$nextTick();

			expect(input.attributes().rows).to.be.equal("4");
		});

		it("should contain the value", () => {
			expect(input.element.value).to.be.equal(model.desc);
		});

		describe("check optional attribute", () => {
			let attributes = ["disabled", "placeholder", "readonly", "inputName"];

			attributes.forEach((name) => {
				it("should set " + name, () => {
					checkAttribute(name, wrapper, schema, "textarea");
				});
			});
		});

		it("input value should be the model value after changed", async () => {
			wrapper.setProps({ model: { desc: "Jane Doe" } });
			await wrapper.vm.$nextTick();

			expect(input.element.value).to.be.equal("Jane Doe");
		});

		it("model value should be the input value if changed", () => {
			input.element.value = "John Smith";
			input.trigger("input");

			expect(wrapper.props().model.desc).to.be.equal("John Smith");
		});

		it("should have 2 classes", () => {
			expect(input.classes()).to.include("applied-class");
			expect(input.classes()).to.include("another-class");
		});
	});

	describe("autoExpand", () => {
		it("does nothing by default", async () => {
			const schema = {
				type: "textarea",
				model: "desc",
				fieldOptions: { rows: 2 }
			};
			const model = { desc: "Hello" };
			const wrapper = createField({ schema, model });
			const textarea = wrapper.find("textarea").element;

			await wrapper.vm.$nextTick();
			expect(textarea.style.height).to.equal("");
			expect(textarea.style.overflowY).to.equal("");
		});

		it("grows to scrollHeight when enabled", async () => {
			const schema = {
				type: "textarea",
				model: "desc",
				fieldOptions: { autoExpand: true, rows: 2 }
			};
			const model = { desc: "Hello" };
			const wrapper = createField({ schema, model });
			const textarea = wrapper.find("textarea").element;

			Object.defineProperty(textarea, "scrollHeight", { value: 120, configurable: true });
			wrapper.setProps({ model: { desc: "Hello\nWorld" } });
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();

			expect(textarea.style.height).to.equal("120px");
			expect(textarea.style.overflowY).to.equal("hidden");
		});

		it("clamps to maxHeight and enables scrolling", async () => {
			const schema = {
				type: "textarea",
				model: "desc",
				fieldOptions: { autoExpand: true, maxHeight: 80, rows: 2 }
			};
			const model = { desc: "Hello" };
			const wrapper = createField({ schema, model });
			const textarea = wrapper.find("textarea").element;

			Object.defineProperty(textarea, "scrollHeight", { value: 200, configurable: true });
			wrapper.setProps({ model: { desc: "Hello\nWorld\nMore\nLines" } });
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();

			expect(textarea.style.height).to.equal("80px");
			expect(textarea.style.overflowY).to.equal("auto");
		});
	});
});
