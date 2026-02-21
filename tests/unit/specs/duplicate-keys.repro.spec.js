/* eslint-disable vue/component-definition-name-casing, vue/one-component-per-file */
import { createLocalVue, mount } from "@vue/test-utils";
import FormGenerator from "@/formGenerator.vue";

const localVue = createLocalVue();

localVue.component("field-button", {
	name: "FieldButton",
	props: {
		schema: {
			type: Object,
			default: () => ({})
		}
	},
	render(h) {
		return h("button", this.schema.text || "button");
	}
});

localVue.component("field-html", {
	name: "FieldHtml",
	props: {
		schema: {
			type: Object,
			default: () => ({})
		}
	},
	render(h) {
		return h("div", { domProps: { innerHTML: this.schema.html || "" } });
	}
});

describe("Duplicate key handling", () => {
	let wrapper;
	let errorSpy;

	afterEach(() => {
		if (wrapper) {
			wrapper.destroy();
			wrapper = null;
		}
		if (errorSpy && errorSpy.restore) {
			errorSpy.restore();
			errorSpy = null;
		}
	});

	function duplicateKeyWarnings() {
		return errorSpy
			.getCalls()
			.map((call) => call.args.join(" "))
			.filter((message) => message.includes("Duplicate keys detected"));
	}

	it("avoids duplicate key warning for sibling button fields with no identity", async () => {
		errorSpy = sinon.spy(console, "error");

		wrapper = mount(FormGenerator, {
			localVue,
			propsData: {
				schema: {
					fields: [
						{ type: "button", text: "Select Seats" },
						{ type: "button", text: "Push Me" }
					]
				},
				model: {},
				options: {}
			}
		});

		await wrapper.vm.$nextTick();

		const warnings = duplicateKeyWarnings();
		expect(warnings.some((w) => w.includes("'|button|'"))).to.be.false;
	});

	it("avoids duplicate key warning for sibling html fields with no identity", async () => {
		errorSpy = sinon.spy(console, "error");

		wrapper = mount(FormGenerator, {
			localVue,
			propsData: {
				schema: {
					fields: [
						{ type: "html", html: "<div>A</div>" },
						{ type: "html", html: "<div>B</div>" }
					]
				},
				model: {},
				options: {}
			}
		});

		await wrapper.vm.$nextTick();

		const warnings = duplicateKeyWarnings();
		expect(warnings.some((w) => w.includes("'|html|'"))).to.be.false;
	});
});
