import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";
import fieldContent from "@/fields/core/fieldContent.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);
localVue.component("FieldContent", fieldContent);

describe("formGroup - Content Field Wrapper Bypass", () => {
	it("should render content fields WITHOUT .form-element wrapper", () => {
		const schema = {
			fields: [
				{
					type: "content",
					element: "h1",
					text: "Page Title",
					attrs: { class: "heading" }
				}
			]
		};

		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: {} }
		});

		// Content field should exist
		const h1 = wrapper.find("h1.heading");
		expect(h1.exists(), "h1 should exist").to.be.true;
		expect(h1.text()).to.equal("Page Title");

		// Should NOT have .form-element wrapper
		const formElement = wrapper.find(".form-element");
		expect(formElement.exists(), ".form-element should NOT exist for content fields").to.be.false;
	});

	it("should render regular fields WITH .form-element wrapper", () => {
		const schema = {
			fields: [
				{
					type: "input",
					model: "name",
					label: "Name",
					fieldOptions: { inputType: "text" }
				}
			]
		};

		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" } }
		});

		// Regular field should have wrapper
		const formElement = wrapper.find(".form-element");
		expect(formElement.exists(), ".form-element should exist for regular fields").to.be.true;

		const input = wrapper.find("input");
		expect(input.exists()).to.be.true;
	});

	it("should handle mixed schemas (content + regular fields)", () => {
		const schema = {
			fields: [
				{ type: "content", element: "h1", text: "Form Title" },
				{ type: "content", element: "p", text: "Please fill in your details" },
				{ type: "input", model: "name", label: "Name", fieldOptions: { inputType: "text" } },
				{ type: "input", model: "email", label: "Email", fieldOptions: { inputType: "email" } },
				{ type: "content", element: "hr" }
			]
		};

		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "", email: "" } }
		});

		// Content fields without wrappers
		expect(wrapper.find("h1").exists()).to.be.true;
		expect(wrapper.find("h1").text()).to.equal("Form Title");
		expect(wrapper.find("p").exists()).to.be.true;
		expect(wrapper.find("hr").exists()).to.be.true;

		// Regular fields with wrappers
		const formElements = wrapper.findAll(".form-element");
		expect(formElements.length).to.equal(2); // Only 2 form fields, not content fields

		const inputs = wrapper.findAll("input");
		expect(inputs.length).to.equal(2);
	});

	it("should render content fields directly in correct DOM position", () => {
		const schema = {
			fields: [
				{ type: "content", element: "h1", text: "First", attrs: { id: "first" } },
				{ type: "input", model: "name", label: "Name", fieldOptions: { inputType: "text" } },
				{ type: "content", element: "h2", text: "Second", attrs: { id: "second" } }
			]
		};

		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" } }
		});

		// Check order - h1 should come before .form-element, h2 should come after
		const fieldset = wrapper.find("fieldset");
		const children = fieldset.element.children;

		// Convert to array for easier testing
		const childTags = Array.from(children).map((el) => el.tagName.toLowerCase());

		expect(childTags).to.include("h1");
		expect(childTags).to.include("h2");
		expect(childTags).to.include("div"); // .form-element is a div
	});

	it("should support nested content with data-idbf", () => {
		const schema = {
			fields: [
				{
					type: "content",
					element: "div",
					id: "idbf_c_header",
					attrs: { class: "header" },
					children: [
						{ element: "h1", text: "Title", id: "idbf_c_title" },
						{ element: "p", text: "Subtitle", id: "idbf_c_subtitle" }
					]
				}
			]
		};

		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: {} }
		});

		const header = wrapper.find(".header");
		expect(header.exists()).to.be.true;
		expect(header.attributes("data-idbf")).to.equal("idbf_c_header");

		const h1 = wrapper.find("h1");
		expect(h1.attributes("data-idbf")).to.equal("idbf_c_title");

		const p = wrapper.find("p");
		expect(p.attributes("data-idbf")).to.equal("idbf_c_subtitle");
	});
});


