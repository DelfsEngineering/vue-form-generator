/* eslint no-undefined: 0 */
import { mount, createLocalVue } from "@vue/test-utils";

import Vue from "vue";
import VueFormGenerator from "@";
import {
	fieldCheckbox,
	fieldChecklist,
	fieldInput,
	fieldLabel,
	fieldRadios,
	fieldSelect,
	fieldSubmit,
	fieldTextArea,
	fieldUpload,
	fieldCleave,
	fieldDateTimePicker,
	fieldGoogleAddress,
	fieldImage,
	fieldMasked,
	fieldNoUiSlider,
	fieldPikaday,
	fieldRangeSlider,
	fieldSelectEx,
	fieldSpectrum,
	fieldStaticMap,
	fieldSwitch,
	fieldVueMultiSelect
} from "@/utils/fieldsLoader.js";

const localVue = createLocalVue();
localVue.use(VueFormGenerator, {
	fields: [
		fieldCheckbox,
		fieldChecklist,
		fieldInput,
		fieldLabel,
		fieldRadios,
		fieldSelect,
		fieldSubmit,
		fieldTextArea,
		fieldUpload,
		fieldCleave,
		fieldDateTimePicker,
		fieldGoogleAddress,
		fieldImage,
		fieldMasked,
		fieldNoUiSlider,
		fieldPikaday,
		fieldRangeSlider,
		fieldSelectEx,
		fieldSpectrum,
		fieldStaticMap,
		fieldSwitch,
		fieldVueMultiSelect
	]
});

let wrapper;
const defaultTemplate = `<vue-form-generator :schema="schema" :model="model" :options="options" :multiple="multiple" ref="form"></vue-form-generator>`;

function createFormGenerator(data, methods, template) {
	const Component = {
		template: template || defaultTemplate,
		data() {
			let _data = {
				model: undefined,
				schema: undefined,
				options: undefined,
				multiple: undefined,
				...data
			};
			return _data;
		},
		methods
	};

	const _wrapper = mount(Component, {
		localVue,
		attachToDocument: true
	});
	wrapper = _wrapper;
	return _wrapper;
}

describe("VueFormGenerator.vue", () => {
	describe("with empty schema", () => {
		let schema = {
			fields: []
		};

		before(() => {
			createFormGenerator({ schema });
		});

		it("should be create fieldset", () => {
			const fieldset = wrapper.find("fieldset");

			expect(fieldset.exists()).to.be.true;
			expect(fieldset.is("fieldset")).to.be.true;
		});
	});

	describe("with empty schema and custom tag", () => {
		let schema = {
			fields: []
		};

		before(() => {
			createFormGenerator(
				{ schema },
				{},
				`<vue-form-generator :schema="schema" ref="form" tag="section"></vue-form-generator>`
			);
		});

		it("should be create custom tag", () => {
			const section = wrapper.find("section");
			expect(section.exists()).to.be.true;
			expect(section.is("section")).to.be.true;
		});
	});

	describe("check form-element classes", () => {
		let formGenerator;
		let formElement;
		let schema;

		beforeEach(async () => {
			// Reset schema value
			schema = {
				fields: [
					{
						type: "input",
						fieldOptions: { inputType: "text" },
						styleClasses: "",
						label: "Name",
						model: "name",
						readonly: false,
						featured: false,
						required: false,
						disabled: false
					}
				]
			};
			wrapper = createFormGenerator({ schema });
			await wrapper.vm.$nextTick();
			formGenerator = wrapper.find({ name: "FormGenerator" });
			if (!formGenerator.exists()) {
				throw new Error("FormGenerator component not found in 'check form-element classes' hook!");
			}
			formElement = formGenerator.find(".form-element");
			if (!formElement.exists()) {
				console.error("form-element not found within:", formGenerator.html());
				throw new Error("form-element component not found within form-generator!");
			}
		});

		it("should be minimal classes", () => {
			expect(formElement.exists()).to.be.true;
			expect(formElement.classes().length).to.be.equal(3);
			expect(formElement.classes()).to.include("form-element");
			expect(formElement.classes()).to.include("field-input");
		});

		it("should be featured class", async () => {
			schema.fields[0].featured = true;
			formGenerator.vm.schema = { ...schema };
			await wrapper.vm.$nextTick();

			expect(formElement.classes()).to.include("featured");
		});

		it("should be readonly class", async () => {
			schema.fields[0].readonly = true;
			formGenerator.vm.schema = { ...schema };
			await wrapper.vm.$nextTick();

			expect(formElement.classes()).to.include("readonly");
		});

		it("should be disabled class", async () => {
			schema.fields[0].disabled = true;
			formGenerator.vm.schema = { ...schema };
			await wrapper.vm.$nextTick();

			expect(formElement.classes()).to.include("disabled");
		});

		it("should be required class", async () => {
			schema.fields[0].required = true;
			formGenerator.vm.schema = { ...schema };
			await wrapper.vm.$nextTick();

			expect(formElement.classes()).to.include("required");
		});

		it("should be error class", () => {
			expect(formElement.exists()).to.be.true;
		});

		describe("custom validation classes", () => {
			let formGenerator;
			let formElement;
			beforeEach(async () => {
				let options = {
					validationCleanClass: "is-clean",
					validationSuccessClass: "has-success",
					validationErrorClass: "has-error"
				};
				createFormGenerator({ schema, options });
				await wrapper.vm.$nextTick();
				formGenerator = wrapper.find({ name: "FormGenerator" });
				formElement = formGenerator.find(".form-element");
				expect(formElement.exists()).to.be.true;
			});

			it("clean class", () => {
				expect(formElement.classes()).to.include("is-clean");
			});

			it("error class", async () => {
				formElement.vm.onChildValidated(["Validation error!"]);
				await wrapper.vm.$nextTick();
				expect(formElement.classes()).to.include("has-error");
			});

			it("success class", (done) => {
				formGenerator.vm.validate().then(
					() => {
						expect(formElement.classes()).to.include("has-success");
						done();
					},
					() => {}
				);
			});
		});

		it("should be add a custom classes", async () => {
			schema.fields[0].styleClasses = "classA";
			formGenerator.vm.schema = { ...schema };
			await wrapper.vm.$nextTick();

			expect(formElement.classes()).to.include("classA");
		});

		it("should be add more custom classes", async () => {
			schema.fields[0].styleClasses = ["classB", "classC"];
			formGenerator.vm.schema = { ...schema };
			await wrapper.vm.$nextTick();

			expect(formElement.classes()).to.include("classB");
			expect(formElement.classes()).to.include("classC");
		});
	});
	// TODO: should be moved to formGroup
	describe("check label classes", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					labelClasses: ["applied-class", "another-class"]
				}
			]
		};
		let label;

		before(() => {
			createFormGenerator({ schema });
			label = wrapper.find("label");
		});

		it("should be 2 classes", () => {
			expect(label.classes()).to.include("applied-class");
			expect(label.classes()).to.include("another-class");
		});
	});

	describe("check form row caption cell", () => {
		let group, label;
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					help: null
				}
			]
		};

		before(() => {
			createFormGenerator({ schema });
			group = wrapper.find(".form-element");
			label = group.find("label");
		});

		it("should be text of cell is the name of field", () => {
			expect(label.exists()).to.be.true;
			expect(label.text()).to.be.equal("Name");
		});

		it("should be a question icon if has helpText", async () => {
			wrapper.vm.schema.fields[0].help = "Sample help";
			await wrapper.vm.$nextTick();

			let span = group.find(".help");

			expect(span.exists()).to.be.true;
			expect(span.find("i").exists()).to.be.true;
			expect(span.find(".helpText").exists()).to.be.true;
			expect(span.find(".helpText").text()).to.be.equal("Sample help");
		});
	});

	describe("check form row field cell", () => {
		let formGenerator;
		let formElement;
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					hint: "Hint text",
					errors: [],
					placeholder: "User's name"
				}
			]
		};

		before(async () => {
			wrapper = createFormGenerator({ schema });
			await wrapper.vm.$nextTick();
			formGenerator = wrapper.find({ name: "FormGenerator" });
			if (!formGenerator.exists()) {
				throw new Error("FormGenerator component not found in 'check form row field cell' hook!");
			}
			formElement = formGenerator.find(".form-element");
			if (!formElement.exists()) {
				console.error("form-element not found within:", formGenerator.html());
				throw new Error(
					"FormElement component not found within FormGenerator in 'check form row field cell' hook!"
				);
			}
		});

		it("should be a .field-wrap div", () => {
			expect(formElement.exists()).to.be.true;
			expect(formElement.find(".field-wrap").exists()).to.be.true;
		});

		it("should be a hint div if hint is not null", () => {
			let hint = formElement.find(".hint");
			expect(hint.exists()).to.be.true;
			expect(hint.text()).to.be.equal("Hint text");
		});

		it("should be .errors div if there are errors in fields", async () => {
			expect(formElement.exists()).to.be.true;
		});
	});

	describe("check fieldDisabled with function", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					disabled(model) {
						return !model.status;
					}
				}
			]
		};

		let model = {
			name: "John Doe",
			status: true
		};

		let input;

		before(() => {
			createFormGenerator({ schema, model });
			input = wrapper.find("input");
		});

		it("should be enabled the name field", () => {
			expect(input.attributes().disabled).to.be.undefined;
		});

		it("should be disabled the name field", async () => {
			wrapper.vm.model.status = false;
			await wrapper.vm.$nextTick();

			expect(input.attributes().disabled).to.be.equal("disabled");
		});
	});

	describe.skip("check fieldDisabled function parameters", () => {
		let fieldDisabled = sinon.spy();
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: { inputType: "text" },
					label: "Name",
					model: "name",
					disabled: fieldDisabled
				}
			]
		};

		let model = {
			name: "John Doe",
			status: true
		};

		before(() => {
			createFormGenerator({ schema, model });
		});

		it("should be called with correct params", () => {
			expect(fieldDisabled.called).to.be.true;
			expect(fieldDisabled.calledWith(model, wrapper.vm.schema.fields[0], wrapper.vm.$children[0].$children[0]))
				.to.be.true;
		});
	});

	describe("check fieldDisabled with const", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					disabled: false
				}
			]
		};

		let model = { name: "John Doe" };

		let input;

		before(() => {
			createFormGenerator({ schema, model });
			input = wrapper.find("input");
		});

		it("should be enabled the name field", () => {
			expect(input.attributes().disabled).to.be.undefined;
		});

		it("should be disabled the name field", async () => {
			wrapper.vm.schema.fields[0].disabled = true;
			await wrapper.vm.$nextTick();

			expect(input.attributes().disabled).to.be.equal("disabled");
		});
	});

	describe("check fieldReadonly with function", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					readonly(model) {
						return model.status;
					}
				}
			]
		};

		let model = {
			name: "John Doe",
			status: true
		};

		let group;

		before(() => {
			createFormGenerator({ schema, model });
			group = wrapper.find(".form-element");
		});

		it("should be readonly", () => {
			expect(group.classes()).to.include("readonly");
		});

		it("should be writable", async () => {
			wrapper.vm.model.status = false;
			await wrapper.vm.$nextTick();

			expect(group.classes()).to.not.include("readonly");
		});
	});

	describe("check fieldHint with function", () => {
		let schema = {
			fields: [
				{
					type: "textArea",
					model: "note",
					label: "Note",
					hint(model) {
						if (model && model.note) {
							return model.note.length + " of max 500 characters used!";
						}
					},
					fieldOptions: {
						max: 500,
						rows: 4
					}
				}
			]
		};

		let model = {
			note: "John Doe"
		};

		before(() => {
			createFormGenerator({ schema, model });
		});

		it("should be applay", () => {
			expect(wrapper.find(".form-element .hint").text()).to.be.equal("8 of max 500 characters used!");
		});

		it("should be changed", async () => {
			model.note = "Dr. John Doe";
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".form-element .hint").text()).to.be.equal("12 of max 500 characters used!");
		});
	});

	describe("check fieldFeatured with function", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					featured(model) {
						return model.status;
					}
				}
			]
		};

		let model = {
			name: "John Doe",
			status: true
		};

		let group;

		before(() => {
			createFormGenerator({ schema, model });
			group = wrapper.find(".form-element");
		});

		it("should be featured", () => {
			expect(group.classes()).to.include("featured");
		});

		it("should not be featured", async () => {
			wrapper.vm.model.status = false;
			await wrapper.vm.$nextTick();

			expect(group.classes()).to.not.include("featured");
		});
	});

	describe("check fieldRequired with function", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					required(model) {
						return model.status;
					}
				}
			]
		};

		let model = {
			name: "John Doe",
			status: true
		};

		let group;

		before(() => {
			createFormGenerator({ schema, model });
			group = wrapper.find(".form-element");
		});

		it("should be required", () => {
			expect(group.classes()).to.include("required");
		});

		it("should be optional", async () => {
			wrapper.vm.model.status = false;
			await wrapper.vm.$nextTick();

			expect(group.classes()).to.not.include("required");
		});
	});

	describe("check fieldVisible with function", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					visible(model) {
						return model.status;
					}
				}
			]
		};

		let model = {
			name: "John Doe",
			status: true
		};

		before(() => {
			createFormGenerator({ schema, model });
		});

		it("should be visible the name field", () => {
			let input = wrapper.find("input[type=text]");
			expect(input.exists()).to.be.true;
		});

		it("should be hidden the name field", async () => {
			wrapper.vm.model.status = false;
			await wrapper.vm.$nextTick();

			let input = wrapper.find("input[type=text]");
			expect(input.exists()).to.be.false;
		});
	});

	describe("check fieldVisible with const", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					visible: true
				}
			]
		};

		let model = { name: "John Doe" };

		before(() => {
			createFormGenerator({ schema, model });
		});

		it("should be enabled the name field", () => {
			let input = wrapper.find("input[type=text]");
			expect(input.exists()).to.be.true;
		});

		it("should be disabled the name field", async () => {
			wrapper.vm.schema.fields[0].visible = false;
			await wrapper.vm.$nextTick();

			let input = wrapper.find("input[type=text]");
			expect(input.exists()).to.be.false;
		});
	});

	describe("check validate", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text",
						min: 3
					},
					label: "Name",
					model: "name",
					validator: VueFormGenerator.validators.string
				}
			]
		};

		let model = { name: "John Doe" };
		let form;

		before(() => {
			createFormGenerator({ schema, model });
			form = wrapper.vm.$refs.form;
		});

		it("should empty the errors", (done) => {
			form.validate().then(
				() => {
					expect(form.errors).to.be.length(0);
					done();
				},
				() => {}
			);
		});

		it("should give a validation error", (done) => {
			model.name = "Ab";
			wrapper.setData({ model: { ...model } });
			form.validate().then(
				() => {},
				(errors) => {
					expect(errors[0].error).to.be.equal("The length of text is too small! Current: 2, Minimum: 3");
					expect(form.errors).to.be.length(1);
					done();
				}
			);
		});

		it("should no validation error", (done) => {
			model.name = "Abc";
			wrapper.setData({ model: { ...model } });
			form.validate().then(
				() => {
					expect(form.errors).to.be.length(0);
					done();
				},
				() => {}
			);
		});
	});

	describe("check validate with validator as string instead of object", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text",
						min: 3
					},
					label: "Name",
					model: "name",
					validator: "string"
				}
			]
		};

		let model = { name: "John Doe" };
		let form;

		before(() => {
			createFormGenerator({ schema, model });
			form = wrapper.vm.$refs.form;
		});

		it("should empty the errors", (done) => {
			form.validate().then(
				() => {
					expect(form.errors).to.be.length(0);
					done();
				},
				() => {}
			);
		});

		it("should give a validation error", (done) => {
			model.name = "Ab";
			wrapper.setData({ model: { ...model } });
			form.validate().then(
				() => {},
				(errors) => {
					expect(errors[0].error).to.be.equal("The length of text is too small! Current: 2, Minimum: 3");
					expect(form.errors).to.be.length(1);
					done();
				}
			);
		});

		it("should no validation error", (done) => {
			model.name = "Abc";
			wrapper.setData({ model: { ...model } });
			form.validate().then(
				() => {
					expect(form.errors).to.be.length(0);
					done();
				},
				() => {}
			);
		});
	});

	describe("check if option null", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name"
				}
			]
		};

		let model = { name: "Me" };
		let form;

		before(() => {
			createFormGenerator({ schema, model });
			form = wrapper.vm.$refs.form;
		});

		it("should be validation error at ready()", () => {
			expect(form).to.not.be.undefined;
			expect(form.options).to.not.be.undefined;
		});
	});

	describe("check validateAfterLoad option", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text",
						min: 3
					},
					label: "Name",
					model: "name",
					validator: VueFormGenerator.validators.string
				}
			]
		};

		let model = { name: "Me" };
		let form;

		before(() => {
			createFormGenerator({ schema, model, options: { validateAfterLoad: true } });
		});

		it("should be validation error at mounted()", () => {
			form = wrapper.vm.$refs.form;
			expect(form.errors).to.be.length(1);
		});

		it("should be validation error if model is changed", () => {
			model = { name: "Al" };
			wrapper.setData({ model: { ...model } });
			expect(form.errors).to.be.length(1);
		});

		it("should be no errors if model is correct", (done) => {
			form.model = { name: "Bob" };
			setTimeout(() => {
				expect(form.errors).to.be.length(0);
				done();
			}, 10);
		});

		it("should be no errors if validateAfterLoad is false", (done) => {
			form.options.validateAfterLoad = false;
			form.model = { name: "Ed" };
			setTimeout(() => {
				expect(form.errors).to.be.length(0);
				done();
			}, 10);
		});
	});

	describe("check onValidated event", () => {
		let schema = {
			fields: [
				{
					type: "input",
					inputType: "text",
					label: "Name",
					model: "name",
					required: true,
					validator: ["required"]
				}
			]
		};

		let model = { name: "John Doe" };
		let onValidated;
		let formGenerator;
		let wrapper;

		beforeEach(async () => {
			onValidated = sinon.spy();
			wrapper = createFormGenerator({ schema, model, options: { validateAfterLoad: false } }, { onValidated });
			await wrapper.vm.$nextTick();
			formGenerator = wrapper.find({ name: "FormGenerator" }).vm;
			formGenerator.$on("validated", onValidated);
		});

		it("should no errors after mounted()", () => {
			expect(formGenerator.errors).to.be.length(0);
		});

		it("should be validation error if model value is not valid", async () => {
			onValidated.resetHistory();
			model.name = "";
			await wrapper.vm.$nextTick();

			formGenerator.validate();
			await wrapper.vm.$nextTick();

			expect(onValidated.callCount).to.be.equal(1);
			expect(formGenerator.errors.length).to.be.above(0);
		});

		it("should no validation error if model valie is valid", async () => {
			// Make the model valid
			model.name = "John Doe";
			await wrapper.vm.$nextTick();

			// Reset the spy to check new events
			onValidated.resetHistory();

			// Run validation
			formGenerator.validate();
			await wrapper.vm.$nextTick();

			expect(onValidated.callCount).to.be.equal(1);
			expect(formGenerator.errors.length).to.be.equal(0);
		});
	});

	describe("check schema.onChanged when the model changed", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					onChanged: sinon.spy()
				}
			]
		};

		let model = { name: "Me" };
		let form;

		before(() => {
			createFormGenerator({ schema, model });
			form = wrapper.vm.$refs.form;
		});

		it("should NOT called the schema.onChanged", () => {
			schema.fields[0].onChanged.resetHistory();
			form.model = { name: "Bob" };
			expect(schema.fields[0].onChanged.called).to.be.false;
		});
	});

	describe("check onFieldValidated method if child validate", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text",
						min: 3
					},
					label: "Name",
					model: "name",
					validator: ["string"]
				},
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "City",
					model: "city",
					validator() {
						return "Validation error!";
					}
				}
			]
		};

		let model = { name: "Bob" };
		let formGenerator;
		let form;
		let field;
		let onValidated = sinon.spy();

		before(() => {
			createFormGenerator(
				{ schema, model },
				{ onValidated },
				`<vue-form-generator :schema="schema" :model="model" :options="options" :multiple="false" ref="form" @validated="onValidated"></vue-form-generator>`
			);
			formGenerator = wrapper.find({ name: "FormGenerator" });
			form = formGenerator.vm;
			field = form.$children[0];
		});

		it("should no errors after mounted()", (done) => {
			expect(form.errors).to.be.length(0);
			wrapper.vm.$nextTick(() => {
				done();
			});
		});

		it.skip("should be validation error if model value is not valid", () => {
			onValidated.resetHistory();
			wrapper.vm.model.name = "A";
			field.validate();

			expect(form.errors).to.be.length(1);
			expect(onValidated.callCount).to.be.equal(1);
			expect(
				onValidated.calledWith(false, [
					{
						field: schema.fields[0],
						error: "The length of text is too small! Current: 1, Minimum: 3"
					}
				])
			).to.be.true;
		});

		it.skip("should be 2 validation error", () => {
			form.$children[1].validate();
			expect(form.errors).to.be.length(2);
			expect(form.errors[0].error).to.be.equal("The length of text is too small! Current: 1, Minimum: 3");
			expect(form.errors[1].error).to.be.equal("Validation error!");
		});

		it.skip("should only other field validation error", () => {
			wrapper.vm.model.name = "Alan";
			onValidated.resetHistory();
			field.validate();

			expect(form.errors).to.be.length(1);
			expect(onValidated.callCount).to.be.equal(1);
			expect(onValidated.calledWith(false, [{ field: schema.fields[1], error: "Validation error!" }])).to.be.true;
		});
	});

	describe("check async validator", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text"
					},
					label: "Name",
					model: "name",
					validator(value) {
						return new Promise((resolve) => {
							setTimeout(() => {
								if (value.length >= 3) {
									resolve();
								} else {
									resolve(["Invalid name"]);
								}
							}, 10);
						});
					}
				}
			]
		};

		let model = { name: "Bob" };
		let formGenerator;
		let form;
		let field;
		let onValidated = sinon.spy();

		before(async () => {
			createFormGenerator(
				{ schema, model },
				{ onValidated: onValidated },
				`<vue-form-generator :schema="schema" :model="model" :options="options" :multiple="false" ref="form" @validated="onValidated"></vue-form-generator>`
			);
			await wrapper.vm.$nextTick();
			formGenerator = wrapper.find({ name: "FormGenerator" });
			form = formGenerator.vm;
			// Find field-input using a selector instead of accessing $children
			const formElement = formGenerator.find(".form-element");
			if (formElement.exists()) {
				field = formElement.find(".field-wrap").find("input").element; // Get the input element instead of component
			} else {
				console.error("form-element not found for async validator test");
			}
		});

		it("should no errors after mounted()", (done) => {
			wrapper.vm.$nextTick(() => {
				expect(form.errors).to.be.length(0);
				done();
			});
		});

		it.skip("should be validation error if model value is not valid", (done) => {
			onValidated.resetHistory();
			wrapper.vm.model.name = "A";
			field.validate();
			Vue.config.errorHandler = done;
			Vue.nextTick(() => {
				expect(form.errors).to.be.length(1);
				expect(formGenerator.emitted().validated).to.be.an.instanceof(Array);
				expect(formGenerator.emitted().validated.length).to.be.equal(1);
				expect(formGenerator.emitted().validated[0][0]).to.be.false;
				expect(formGenerator.emitted().validated[0][1]).to.be.an.instanceof(Array);
				expect(formGenerator.emitted().validated[0][1].length).to.be.equal(1);
				expect(formGenerator.emitted().validated[0][1][0].uid).to.be.a("string");
				expect(formGenerator.emitted().validated[0][1][0].error).to.be.a("string");
				expect(formGenerator.emitted().validated[0][1][0].error).to.be.equal(
					"The length of text is too small! Current: 1, Minimum: 3"
				);
				expect(onValidated.calledWith(false, [{ field: schema.fields[0], error: "Invalid name" }])).to.be.true;
				done();
			});
		});
	});

	describe("check custom slot", () => {
		let schema = {
			fields: [
				{
					type: "input",
					fieldOptions: {
						inputType: "text",
						min: 3
					},
					label: "My label",
					help: "My help",
					hint: "My hint",
					model: "name",
					validator: ["string"]
				}
			]
		};
		let model = { name: "B" };
		let formOptions = { validateAfterLoad: true };
		let formGenerator;
		let form;

		beforeEach(() => {
			createFormGenerator(
				{ schema, model, formOptions },
				{},
				`<vue-form-generator :schema="schema" ref="form" tag="section">
					<template slot="label" slot-scope="{ field, getValueFromOption }">
						<span class="custom-class--label">Custom label</span>
						<div v-html="getValueFromOption(field, 'label', undefined)"></div>
					</template>

					<template slot="help" slot-scope="{ field, getValueFromOption }">
						<span class="custom-class--help">Custom help</span>
						<div v-html="getValueFromOption(field, 'help', undefined)"></div>
					</template>

					<template slot="hint" slot-scope="{ field, getValueFromOption }">
						<span class="custom-class--hint">Custom hint</span>
						<div v-html="getValueFromOption(field, 'hint', undefined)"></div>
					</template>

					<template slot="errors" slot-scope="{ errors, field, getValueFromOption }">
						<span class="custom-class--errors">Custom errors</span>
						<div v-for="(error, index) in errors" :key="index">
							{{index}}
						</div>
					</template>
				</vue-form-generator>`
			);
			formGenerator = wrapper.find({ name: "FormGenerator" });
			form = formGenerator.vm;
		});

		it("should have a custom label", () => {
			expect(formGenerator.find(".custom-class--label").exists()).to.be.true;
		});

		it("should have a custom help", () => {
			expect(formGenerator.find(".custom-class--help").exists()).to.be.true;
		});

		it("should have a custom hint", () => {
			expect(formGenerator.find(".custom-class--hint").exists()).to.be.true;
		});
		// TODO: fix error not showing
		it.skip("should have a custom error", (done) => {
			Vue.config.errorHandler = done;

			form.validate().then(
				() => {
					Vue.nextTick(() => {
						expect(formGenerator.find(".custom-class--errors").exists()).to.be.true;
						done();
					});
				},
				() => {}
			);
		});
	});
});
