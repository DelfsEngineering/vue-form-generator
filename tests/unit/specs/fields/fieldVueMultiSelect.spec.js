process.stdout.write = console.log;
import { mount, createLocalVue } from "@vue/test-utils";
import Vue from "vue";
import fieldVueMultiSelect from "@/fields/optional/fieldVueMultiSelect.vue";
import VueMultiSelect from "vue-multiselect";

const localVue = createLocalVue();
let wrapper;
let input;

function createField(data, methods) {
	const _wrapper = mount(fieldVueMultiSelect, {
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
		},
		components: {
			multiselect: VueMultiSelect
		}
	});
	if (methods) {
		_wrapper.setMethods(methods);
	}
	wrapper = _wrapper;
	input = wrapper.find(".multiselect");

	return _wrapper;
}

// Move schema to the top scope
const baseSchema = {
	type: "vueMultiSelect",
	label: "Cities",
	model: "city",
	required: false,
	values: ["London", "Paris", "Rome", "Berlin"],
	fieldOptions: {
		multiple: true
	}
};

describe("fieldVueMultiSelect.vue", () => {
	// Debugging test to ensure basic setup is working
	it("basic test runs", () => {
		expect(true).to.be.true;
	});

	describe("check template", () => {
		let schema = { ...baseSchema }; // Clone base schema to avoid mutation
		let model = { city: "Paris" };

		before(() => {
			createField({ schema, model });
		});

		it("should contain a select element", async () => {
			console.log("Testing: should contain a select element");
			expect(wrapper.exists()).to.be.true;
			await Vue.nextTick();
			expect(input.exists()).to.be.true;
			expect(input.classes()).to.not.include("form-control");
			expect(input.classes()).to.not.include("multiselect--disabled");
		});

		it("should contain option elements", async () => {
			console.log("Testing: should contain option elements");
			let options = input.findAll("li.multiselect__element .multiselect__option");
			expect(options.length).to.be.equal(schema.values.length);
			await Vue.nextTick();
			expect(options.at(1).find("span").text()).to.be.equal("Paris");
			expect(options.at(1).classes()).to.include("multiselect__option--selected");
		});

		it("should set disabled", async () => {
			console.log("Testing: should set disabled");
			schema.disabled = true;
			wrapper.setProps({ schema: { ...schema } });
			await Vue.nextTick();
			expect(input.classes()).to.include("multiselect--disabled");

			schema.disabled = false;
			wrapper.setProps({ schema: { ...schema } });
			await Vue.nextTick();
		});
	});

	describe("with objects", () => {
		let schema = { ...baseSchema }; // Clone base schema
		let model = {
			city: [
				{
					name: "Vue.js",
					language: "JavaScript"
				}
			]
		};

		before(() => {
			schema.values = [
				{ name: "Vue.js", language: "JavaScript" },
				{ name: "Rails", language: "Ruby" },
				{ name: "Sinatra", language: "Ruby" }
			];
			createField({ schema, model });
		});

		it("model value should work with objects", async () => {
			console.log("Testing: model value should work with objects");
			schema.fieldOptions = { label: "name", trackBy: "name" };
			wrapper.setProps({ schema: { ...schema } });
			await Vue.nextTick();

			expect(wrapper.props().model.city.length).to.be.equal(1);
			expect(wrapper.props().model.city[0]).to.be.deep.equal(schema.values[0]);
		});

		it("options should contain only text specified in label", async () => {
			console.log("Testing: options should contain only text specified in label");
			schema.fieldOptions = { label: "language", trackBy: "language" };
			wrapper.setProps({ schema: { ...schema } });

			await Vue.nextTick();
			let options = input.findAll("li .multiselect__option");

			expect(options.at(0).find("span").text()).to.be.equal("JavaScript");
		});
	});
});
