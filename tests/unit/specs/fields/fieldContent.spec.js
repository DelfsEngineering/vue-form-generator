import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FieldContent from "@/fields/core/fieldContent.vue";

const localVue = createLocalVue();

describe("fieldContent.vue - Basic Rendering", () => {
	it("should render a simple element with specified tag name", () => {
		const schema = {
			element: "h1",
			text: "Hello World"
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.find("h1").exists()).to.be.true;
		expect(wrapper.find("h1").text()).to.equal("Hello World");
	});

	it("should render text content", () => {
		const schema = {
			element: "p",
			text: "This is a paragraph"
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.text()).to.equal("This is a paragraph");
	});

	it("should apply attributes (class, id, data-*, aria-*)", () => {
		const schema = {
			element: "div",
			text: "Content",
			attrs: {
				class: "test-class another-class",
				id: "test-id",
				"data-testid": "my-test",
				"aria-label": "Test Label"
			}
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		const element = wrapper.find("div");
		expect(element.classes()).to.include("test-class");
		expect(element.classes()).to.include("another-class");
		expect(element.attributes("id")).to.equal("test-id");
		expect(element.attributes("data-testid")).to.equal("my-test");
		expect(element.attributes("aria-label")).to.equal("Test Label");
	});

	it("should default to 'div' when no element specified", () => {
		const schema = {
			text: "Default element"
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.find("div").exists()).to.be.true;
		expect(wrapper.find("div").text()).to.equal("Default element");
	});

	it("should render self-closing elements", () => {
		const schemas = [
			{ element: "hr", attrs: { class: "divider" } },
			{ element: "br" },
			{ element: "img", attrs: { src: "test.jpg", alt: "Test" } }
		];

		schemas.forEach((schema) => {
			const wrapper = mount(FieldContent, {
				localVue,
				propsData: { schema }
			});

			expect(wrapper.find(schema.element).exists()).to.be.true;
		});
	});

	it("should handle empty text content", () => {
		const schema = {
			element: "span",
			text: ""
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.find("span").exists()).to.be.true;
		expect(wrapper.find("span").text()).to.equal("");
	});

	it("should handle missing attrs gracefully", () => {
		const schema = {
			element: "p",
			text: "No attrs"
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.find("p").exists()).to.be.true;
	});
});

describe("fieldContent.vue - Nested Content", () => {
	it("should render nested children", () => {
		const schema = {
			element: "div",
			attrs: { class: "parent" },
			children: [
				{ element: "span", text: "Child 1" },
				{ element: "span", text: "Child 2" }
			]
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.find(".parent").exists()).to.be.true;
		const spans = wrapper.findAll("span");
		expect(spans.length).to.equal(2);
		expect(spans.at(0).text()).to.equal("Child 1");
		expect(spans.at(1).text()).to.equal("Child 2");
	});

	it("should render deeply nested children recursively", () => {
		const schema = {
			element: "div",
			attrs: { class: "level-1" },
			children: [
				{
					element: "div",
					attrs: { class: "level-2" },
					children: [
						{
							element: "span",
							attrs: { class: "level-3" },
							text: "Deep content"
						}
					]
				}
			]
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.find(".level-1").exists()).to.be.true;
		expect(wrapper.find(".level-2").exists()).to.be.true;
		expect(wrapper.find(".level-3").exists()).to.be.true;
		expect(wrapper.find(".level-3").text()).to.equal("Deep content");
	});

	it("should handle mixed siblings", () => {
		const schema = {
			element: "ul",
			children: [
				{ element: "li", text: "Item 1" },
				{ element: "li", text: "Item 2" },
				{ element: "li", text: "Item 3" }
			]
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		const items = wrapper.findAll("li");
		expect(items.length).to.equal(3);
		expect(items.at(0).text()).to.equal("Item 1");
		expect(items.at(1).text()).to.equal("Item 2");
		expect(items.at(2).text()).to.equal("Item 3");
	});

	it("should preserve order of children", () => {
		const schema = {
			element: "div",
			children: [
				{ element: "p", text: "First", attrs: { id: "first" } },
				{ element: "p", text: "Second", attrs: { id: "second" } },
				{ element: "p", text: "Third", attrs: { id: "third" } }
			]
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		const paragraphs = wrapper.findAll("p");
		expect(paragraphs.at(0).attributes("id")).to.equal("first");
		expect(paragraphs.at(1).attributes("id")).to.equal("second");
		expect(paragraphs.at(2).attributes("id")).to.equal("third");
	});

	it("should handle empty children array", () => {
		const schema = {
			element: "div",
			children: []
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.find("div").exists()).to.be.true;
		expect(wrapper.find("div").text()).to.equal("");
	});
});

describe("fieldContent.vue - HTML Content", () => {
	it("should render raw HTML via html property", () => {
		const schema = {
			element: "div",
			html: "<strong>Bold</strong> and <em>italic</em>"
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.find("strong").exists()).to.be.true;
		expect(wrapper.find("em").exists()).to.be.true;
		expect(wrapper.find("strong").text()).to.equal("Bold");
		expect(wrapper.find("em").text()).to.equal("italic");
	});

	it("should prefer html over text when both present", () => {
		const schema = {
			element: "div",
			html: "<span>HTML content</span>",
			text: "Text content"
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.find("span").exists()).to.be.true;
		expect(wrapper.find("span").text()).to.equal("HTML content");
		expect(wrapper.text()).to.not.include("Text content");
	});

	it("should render complex HTML structures", () => {
		const schema = {
			element: "div",
			html: '<a href="/test" class="link">Click <strong>here</strong></a>'
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		const link = wrapper.find("a");
		expect(link.exists()).to.be.true;
		expect(link.classes()).to.include("link");
		expect(link.attributes("href")).to.equal("/test");
		expect(link.find("strong").text()).to.equal("here");
	});
});

describe("fieldContent.vue - Identity System", () => {
	it("should add data-idbf from schema.id", () => {
		const schema = {
			element: "div",
			text: "Content",
			id: "idbf_c_custom"
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.attributes("data-idbf")).to.equal("idbf_c_custom");
	});

	it("should work with nested elements with IDs", () => {
		const schema = {
			element: "div",
			id: "idbf_c_parent",
			children: [
				{ element: "span", text: "Child 1", id: "idbf_c_child1" },
				{ element: "span", text: "Child 2", id: "idbf_c_child2" }
			]
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.attributes("data-idbf")).to.equal("idbf_c_parent");
		const spans = wrapper.findAll("span");
		expect(spans.at(0).attributes("data-idbf")).to.equal("idbf_c_child1");
		expect(spans.at(1).attributes("data-idbf")).to.equal("idbf_c_child2");
	});

	it("should not add data-idbf when id is not provided", () => {
		const schema = {
			element: "div",
			text: "No ID"
		};

		const wrapper = mount(FieldContent, {
			localVue,
			propsData: { schema }
		});

		expect(wrapper.attributes("data-idbf")).to.be.undefined;
	});
});
