import { mount, createLocalVue } from "@vue/test-utils";
import Vue from "vue";
import FieldChecklist from "@/fields/core/fieldChecklist.vue";

const localVue = createLocalVue();

function createField(data) {
	return mount(FieldChecklist, {
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
}

describe("FieldChecklist.vue", () => {
	describe("visibility and ids", () => {
		let wrapper;

		before(() => {
			const schema = {
				type: "checklist",
				label: "Skills",
				model: "skills",
				fieldOptions: { listBox: true },
				values: [
					{ name: "JavaScript", value: "js" },
					{ name: "Vue", value: "vue", visible: false },
					{ name: "React", value: "react" }
				]
			};
			const model = { skills: ["js"] };

			wrapper = createField({ schema, model, fieldId: "skills-field" });
		});

		after(() => {
			if (wrapper) wrapper.destroy();
		});

		it("renders only visible checklist items", () => {
			const inputs = wrapper.findAll("input[type='checkbox']");
			expect(inputs.length).to.equal(2);

			const ids = inputs.wrappers.map((i) => i.attributes().id);
			expect(ids).to.include("skills-field-js");
			expect(ids).to.include("skills-field-react");
			expect(ids.find((id) => id && id.includes("vue"))).to.be.undefined;
		});
	});

	describe("disabled and classes", () => {
		let wrapper;

		before(() => {
			const schema = {
				type: "checklist",
				label: "Skills",
				model: "skills",
				fieldOptions: {
					listBox: true,
					disabled: (item) => item.value === "vue"
				},
				values: [
					{ name: "JavaScript", value: "js", disabled: true },
					{ name: "Vue", value: "vue" }
				]
			};
			const model = { skills: ["js"] };

			wrapper = createField({ schema, model, fieldId: "skills-field" });
		});

		after(() => {
			if (wrapper) wrapper.destroy();
		});

		it("applies disabled attr and classes per item and option", () => {
			const rows = wrapper.findAll(".list-row");
			expect(rows.length).to.equal(2);

			const inputs = wrapper.findAll("input[type='checkbox']");
			expect(inputs.at(0).attributes().disabled).to.not.be.undefined;
			expect(inputs.at(1).attributes().disabled).to.not.be.undefined;

			expect(rows.at(0).classes()).to.include("disabled");
			expect(rows.at(1).classes()).to.include("disabled");
			expect(rows.at(0).classes()).to.include("checked");
			expect(rows.at(1).classes()).to.not.include("checked");
		});
	});
});
