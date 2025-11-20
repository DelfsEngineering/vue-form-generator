import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";
import fieldUpload from "@/fields/core/fieldUpload.vue";
import fieldImage from "@/fields/optional/fieldImage.vue";

const localVue = createLocalVue();
localVue.component("FieldInput", fieldInput);
localVue.component("FieldUpload", fieldUpload);
localVue.component("FieldImage", fieldImage);

describe("Wrapper keeper flag in minimal mode", () => {
	it("keeps wrappers when keepWrapper=true", async () => {
		const schema = {
			fields: [
				{ type: "upload", label: "File", model: "file", keepWrapper: true },
				{ type: "image", label: "Avatar", model: "avatar", keepWrapper: true }
			]
		};
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { file: null, avatar: null }, legacy: false }
		});

		// upload wrapper should NOT be flattened
		const uploadWrapper = wrapper.find(".field-upload .wrapper");
		expect((uploadWrapper.attributes("style") || "").toLowerCase()).to.not.contain("display: contents");
		expect(uploadWrapper.attributes("data-vfg-role"), "no control-wrapper role when kept").to.be.undefined;

		// image wrapper should NOT be flattened
		const imageWrapper = wrapper.find(".field-image .wrapper");
		expect((imageWrapper.attributes("style") || "").toLowerCase()).to.not.contain("display: contents");
		expect(imageWrapper.attributes("data-vfg-role"), "no control-wrapper role when kept").to.be.undefined;
	});

	it("flattens wrappers by default in minimal mode", async () => {
		const schema = {
			fields: [{ type: "input", label: "Name", model: "name", fieldOptions: { inputType: "text" } }]
		};
		const wrapper = mount(FormGenerator, {
			localVue,
			propsData: { schema, model: { name: "" }, legacy: false }
		});

		const controlWrapper = wrapper.find(".field-input .wrapper");
		expect((controlWrapper.attributes("style") || "").replace(/\s+/g, " ")).to.contain("display: contents");
		expect(controlWrapper.attributes("data-vfg-role")).to.equal("control-wrapper");
	});
});
