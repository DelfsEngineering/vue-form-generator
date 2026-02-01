import { expect } from "chai";
import { mount, createLocalVue } from "@vue/test-utils";
import Vue from "vue";
import formGroupIterate from "@/formGroupIterate.vue";
import formGroup from "@/formGroup.vue";
import formElement from "@/formElement.vue";
import fieldInput from "@/fields/core/fieldInput.vue";

const localVue = createLocalVue();

// Register components
localVue.component("FormGroup", formGroup);
localVue.component("FormElement", formElement);
localVue.component("FieldInput", fieldInput);

describe("formGroupIterate.vue", () => {
	let wrapper;

	const createWrapper = (propsData = {}) => {
		return mount(formGroupIterate, {
			localVue,
			propsData: {
				iterate: { items: "cards" },
				fields: [],
				model: {},
				options: {},
				errors: [],
				eventBus: new Vue(),
				...propsData
			}
		});
	};

	afterEach(() => {
		if (wrapper) {
			wrapper.destroy();
		}
	});

	describe("rendering", () => {
		it("should render nothing for empty items array", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: { cards: [] }
			});

			// Should not render any form-group instances
			expect(wrapper.findAll(formGroup).length).to.equal(0);
		});

		it("should render nothing when items path is missing", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {}
			});

			expect(wrapper.findAll(formGroup).length).to.equal(0);
		});

		it("should render one form-group per item", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [
						{ id: 1, title: "Card A" },
						{ id: 2, title: "Card B" }
					]
				}
			});

			expect(wrapper.findAll(formGroup).length).to.equal(2);
		});

		it("should render form-groups with correct keys", () => {
			wrapper = createWrapper({
				iterate: { items: "cards", key: "id" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [
						{ id: 1, title: "Card A" },
						{ id: 2, title: "Card B" }
					]
				}
			});

			const groups = wrapper.findAll(formGroup);
			// Check keys via vnode.key
			expect(groups.at(0).vm.$vnode.key).to.equal(1);
			expect(groups.at(1).vm.$vnode.key).to.equal(2);
		});

		it("should use index as key when no key is specified", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }, { title: "Card B" }]
				}
			});

			const groups = wrapper.findAll(formGroup);
			// Keys should be the index
			expect(groups.at(0).vm.$vnode.key).to.equal(0);
			expect(groups.at(1).vm.$vnode.key).to.equal(1);
		});

		it("should use nested key path", () => {
			wrapper = createWrapper({
				iterate: { items: "cards", key: "metadata.uuid" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [
						{ title: "Card A", metadata: { uuid: "abc-123" } },
						{ title: "Card B", metadata: { uuid: "xyz-789" } }
					]
				}
			});

			const groups = wrapper.findAll(formGroup);
			expect(groups.at(0).vm.$vnode.key).to.equal("abc-123");
			expect(groups.at(1).vm.$vnode.key).to.equal("xyz-789");
		});

		it("should use function key", () => {
			wrapper = createWrapper({
				iterate: {
					items: "cards",
					key: (item, index) => `card-${item.id}-${index}`
				},
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [
						{ id: 5, title: "Card A" },
						{ id: 10, title: "Card B" }
					]
				}
			});

			const groups = wrapper.findAll(formGroup);
			expect(groups.at(0).vm.$vnode.key).to.equal("card-5-0");
			expect(groups.at(1).vm.$vnode.key).to.equal("card-10-1");
		});
	});

	describe("model passing", () => {
		it("should pass each item as model to form-group", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [
						{ id: 1, title: "Card A" },
						{ id: 2, title: "Card B" }
					]
				}
			});

			const groups = wrapper.findAll(formGroup);

			// First group gets first item
			expect(groups.at(0).props("model")).to.deep.equal({ id: 1, title: "Card A" });

			// Second group gets second item
			expect(groups.at(1).props("model")).to.deep.equal({ id: 2, title: "Card B" });
		});

		it("should pass fields to form-group", () => {
			const fields = [
				{ type: "input", model: "title" },
				{ type: "input", model: "description" }
			];

			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields,
				model: {
					cards: [{ title: "Card A" }]
				}
			});

			const group = wrapper.find(formGroup);
			expect(group.props("fields")).to.equal(fields);
		});

		it("should pass options to form-group", () => {
			const options = { validateAfterChanged: true };

			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				},
				options
			});

			const group = wrapper.find(formGroup);
			expect(group.props("options")).to.equal(options);
		});

		it("should pass errors to form-group", () => {
			const errors = [{ field: "title", error: "Required" }];

			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "" }]
				},
				errors
			});

			const group = wrapper.find(formGroup);
			expect(group.props("errors")).to.equal(errors);
		});

		it("should pass eventBus to form-group", () => {
			const eventBus = new Vue();

			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				},
				eventBus
			});

			const group = wrapper.find(formGroup);
			expect(group.props("eventBus")).to.equal(eventBus);
		});
	});

	describe("items resolution", () => {
		it("should resolve nested path", () => {
			wrapper = createWrapper({
				iterate: { items: "data.cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					data: {
						cards: [{ title: "Card A" }, { title: "Card B" }]
					}
				}
			});

			expect(wrapper.findAll(formGroup).length).to.equal(2);
		});

		it("should resolve function items", () => {
			wrapper = createWrapper({
				iterate: {
					items: (model) => model.cards.filter((c) => c.active)
				},
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [
						{ title: "Card A", active: true },
						{ title: "Card B", active: false },
						{ title: "Card C", active: true }
					]
				}
			});

			// Should only render 2 groups (filtered)
			expect(wrapper.findAll(formGroup).length).to.equal(2);
		});

		it("should handle items array changes reactively", async () => {
			const model = {
				cards: [{ title: "Card A" }]
			};

			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model
			});

			expect(wrapper.findAll(formGroup).length).to.equal(1);

			// Add an item
			model.cards.push({ title: "Card B" });
			await wrapper.vm.$nextTick();

			expect(wrapper.findAll(formGroup).length).to.equal(2);

			// Remove items
			model.cards = [];
			await wrapper.vm.$nextTick();

			expect(wrapper.findAll(formGroup).length).to.equal(0);
		});
	});

	describe("group properties", () => {
		it("should pass group object if provided", () => {
			const group = { legend: "Test Legend", styleClasses: "test-class" };

			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				},
				group
			});

			const formGroupWrapper = wrapper.find(formGroup);
			// Check that group properties are passed (may be a merged object, not exact reference)
			expect(formGroupWrapper.props("group")).to.deep.include(group);
		});

		it("should pass tag property", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				},
				tag: "div"
			});

			const formGroupWrapper = wrapper.find(formGroup);
			expect(formGroupWrapper.props("tag")).to.equal("div");
		});
	});

	describe("wrapper element (optional)", () => {
		it("should not create wrapper by default (no wrapperTag)", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				}
			});

			// Should render only the form-group elements, no extra wrapper
			const groups = wrapper.findAll(formGroup);
			expect(groups.length).to.equal(1);
		});

		it("should create wrapper when wrapperTag is provided", () => {
			wrapper = createWrapper({
				iterate: { items: "cards", wrapperTag: "section" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				}
			});

			expect(wrapper.element.tagName.toLowerCase()).to.equal("section");
		});

		it("should apply iterate.wrapperClass to wrapper element", () => {
			wrapper = createWrapper({
				iterate: {
					items: "cards",
					wrapperTag: "div",
					wrapperClass: "flex gap-4 p-6"
				},
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				}
			});

			expect(wrapper.classes()).to.include("flex");
			expect(wrapper.classes()).to.include("gap-4");
			expect(wrapper.classes()).to.include("p-6");
		});

		it("should not apply wrapperClass without wrapperTag", () => {
			wrapper = createWrapper({
				iterate: {
					items: "cards",
					wrapperClass: "should-not-appear" // No wrapperTag, so no wrapper
				},
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				}
			});

			// wrapperClass should be ignored when no wrapperTag
			expect(wrapper.classes()).to.not.include("should-not-appear");
		});
	});

	describe("item styling (styleClasses)", () => {
		it("should apply static styleClasses to all items", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }, { title: "Card B" }]
				},
				group: { styleClasses: "card-item-class" }
			});

			const groups = wrapper.findAll(formGroup);
			groups.wrappers.forEach((groupWrapper) => {
				expect(groupWrapper.props("group").styleClasses).to.equal("card-item-class");
			});
		});

		it("should evaluate styleClasses function per item", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [
						{ title: "Card A", active: true },
						{ title: "Card B", active: false }
					]
				},
				group: {
					styleClasses: (item) => (item.active ? "active-card" : "inactive-card")
				}
			});

			const groups = wrapper.findAll(formGroup);
			expect(groups.at(0).props("group").styleClasses).to.equal("active-card");
			expect(groups.at(1).props("group").styleClasses).to.equal("inactive-card");
		});

		it("should support complex conditional styleClasses logic", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [
						{ title: "Card A", priority: "high" },
						{ title: "Card B", priority: "medium" },
						{ title: "Card C", priority: "low" }
					]
				},
				group: {
					styleClasses: (item) => {
						let classes = "base-card";
						if (item.priority === "high") {
							classes += " bg-red-100";
						} else if (item.priority === "medium") {
							classes += " bg-yellow-100";
						} else {
							classes += " bg-gray-100";
						}
						return classes;
					}
				}
			});

			const groups = wrapper.findAll(formGroup);
			expect(groups.at(0).props("group").styleClasses).to.include("bg-red-100");
			expect(groups.at(1).props("group").styleClasses).to.include("bg-yellow-100");
			expect(groups.at(2).props("group").styleClasses).to.include("bg-gray-100");
		});

		it("should preserve other group properties with styleClasses", () => {
			const groupConfig = { legend: "Test Legend", helpText: "Help", styleClasses: "item-styling" };

			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				},
				group: groupConfig
			});

			const formGroupWrapper = wrapper.find(formGroup);
			const passedGroup = formGroupWrapper.props("group");
			expect(passedGroup.legend).to.equal("Test Legend");
			expect(passedGroup.helpText).to.equal("Help");
			expect(passedGroup.styleClasses).to.equal("item-styling");
		});

		it("should work with no styleClasses (minimal DOM)", () => {
			wrapper = createWrapper({
				iterate: { items: "cards" },
				fields: [{ type: "input", model: "title" }],
				model: {
					cards: [{ title: "Card A" }]
				}
			});

			const groups = wrapper.findAll(formGroup);
			expect(groups.length).to.equal(1);
			// Should still render, just without extra styling
		});
	});
});
