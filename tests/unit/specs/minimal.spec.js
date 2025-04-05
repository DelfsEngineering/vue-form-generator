import { mount, createLocalVue } from "@vue/test-utils";
import { expect } from "chai";
import FormGenerator from "@/formGenerator.vue";
import fieldInput from "@/fields/core/fieldInput.vue";
import fieldCheckbox from "@/fields/core/fieldCheckbox.vue";
import fieldSelect from "@/fields/core/fieldSelect.vue";
import fieldTextArea from "@/fields/core/fieldTextArea.vue";
import fieldChecklist from "@/fields/core/fieldChecklist.vue";
import fieldRadios from "@/fields/core/fieldRadios.vue";
import fieldLabel from "@/fields/core/fieldLabel.vue";
import fieldSubmit from "@/fields/core/fieldSubmit.vue";
import fieldUpload from "@/fields/core/fieldUpload.vue";
import fieldCleave from "@/fields/optional/fieldCleave.vue";
import fieldDateTimePicker from "@/fields/optional/fieldDateTimePicker.vue";
import fieldGoogleAddress from "@/fields/optional/fieldGoogleAddress.vue";
import fieldImage from "@/fields/optional/fieldImage.vue";
import fieldMasked from "@/fields/optional/fieldMasked.vue";
import fieldNoUiSlider from "@/fields/optional/fieldNoUiSlider.vue";
import fieldPikaday from "@/fields/optional/fieldPikaday.vue";
import fieldSelectEx from "@/fields/optional/fieldSelectEx.vue";
import fieldSpectrum from "@/fields/optional/fieldSpectrum.vue";

// Create a local Vue instance
const localVue = createLocalVue();
// Register the components globally on the local instance
localVue.component("FieldInput", fieldInput);
localVue.component("FieldCheckbox", fieldCheckbox);
localVue.component("FieldSelect", fieldSelect);
localVue.component("FieldTextArea", fieldTextArea);
localVue.component("FieldChecklist", fieldChecklist);
localVue.component("FieldRadios", fieldRadios);
localVue.component("FieldLabel", fieldLabel);
localVue.component("FieldSubmit", fieldSubmit);
localVue.component("FieldUpload", fieldUpload);
localVue.component("FieldCleave", fieldCleave);
localVue.component("FieldDatetime", fieldDateTimePicker);
localVue.component("FieldGoogleAddress", fieldGoogleAddress);
localVue.component("FieldImage", fieldImage);
localVue.component("FieldMasked", fieldMasked);
localVue.component("FieldNoUiSlider", fieldNoUiSlider);
localVue.component("FieldPikaday", fieldPikaday);
localVue.component("FieldSelectEx", fieldSelectEx);
localVue.component("FieldSpectrum", fieldSpectrum);

describe("Minimal FormGenerator Mount Test", () => {
	it("should mount with a minimal schema and model", async () => {
		const schema = {
			fields: [
				{
					type: "input",
					label: "Name",
					model: "name",
					fieldOptions: {
						inputType: "text"
					}
				},
				{
					type: "checkbox",
					label: "Active",
					model: "status",
					default: true
				},
				{
					type: "select",
					label: "Type",
					model: "type",
					values: ["Admin", "User", "Guest"]
				},
				{
					type: "textArea",
					label: "Notes",
					model: "notes",
					fieldOptions: {
						rows: 4
					}
				},
				{
					type: "checklist",
					label: "Options",
					model: "options",
					values: ["Option 1", "Option 2", "Option 3"]
				},
				{
					type: "radios",
					label: "Version",
					model: "version",
					values: ["v1", "v2", "v3"]
				},
				{
					type: "label",
					label: "Info Label",
					model: "infoText"
				},
				{
					type: "submit",
					fieldOptions: {
						buttonText: "Register"
					},
					validateBeforeSubmit: true
				},
				{
					type: "upload",
					label: "Profile Picture"
				},
				{
					type: "cleave",
					label: "Credit Card",
					model: "creditCard",
					fieldOptions: {
						cleaveOptions: {
							creditCard: true
						}
					}
				},
				{
					type: "datetime",
					label: "Start Date",
					model: "startDate",
					fieldOptions: {
						dateTimePickerOptions: {
							format: "YYYY-MM-DD HH:mm"
						}
					}
				},
				{
					type: "googleAddress",
					label: "Location",
					model: "location"
				},
				{
					type: "image",
					label: "Avatar",
					model: "avatar",
					preview: true
				},
				{
					type: "masked",
					label: "Phone",
					model: "phone",
					mask: "(999) 999-9999",
					fieldOptions: {}
				},
				{
					type: "pikaday",
					label: "Birthday",
					model: "birthday",
					pikadayOptions: {
						format: "YYYY-MM-DD"
					}
				},
				{
					type: "selectEx",
					label: "Country",
					model: "country",
					values: ["USA", "Canada", "Mexico"]
				},
				{
					type: "spectrum",
					label: "Color",
					model: "color"
				},
				{
					type: "noUiSlider",
					label: "Range",
					model: "rangeValue",
					fieldOptions: {
						min: 0,
						max: 100,
						noUiSliderOptions: {
							start: [50],
							range: {
								min: 0,
								max: 100
							}
						}
					}
				}
			]
		};

		const model = {
			name: "Test Name",
			status: true,
			type: "User",
			notes: "Some\nMultiline\nNotes",
			options: ["Option 1", "Option 3"],
			version: "v2",
			infoText: "This is some static info",
			creditCard: "4111111111111111",
			startDate: "2024-04-05 10:00",
			location: "1600 Amphitheatre Parkway, Mountain View, CA",
			avatar: null,
			phone: "1234567890",
			birthday: "2000-01-01",
			country: "Canada",
			color: "#ff0000",
			rangeValue: 50
		};

		let wrapper;
		let exception = null;
		try {
			wrapper = mount(FormGenerator, {
				localVue,
				propsData: {
					schema: schema,
					model: model
				}
			});
		} catch (e) {
			exception = e;
			console.error("Error during mount:", e); // Log error if mount fails
		}

		// Check if mounting threw an error (like stack overflow)
		expect(exception, "Mounting threw an exception").to.be.null;

		// Basic check to ensure the component rendered something if mount succeeded
		if (!exception) {
			expect(wrapper.exists()).to.be.true;
			// Check for input field
			expect(wrapper.find(fieldInput).exists()).to.be.true;
			expect(wrapper.find("input[type='text']").exists()).to.be.true;
			expect(wrapper.find("input[type='text']").element.value).to.equal("Test Name");

			// Check for checkbox field
			expect(wrapper.find(fieldCheckbox).exists()).to.be.true;
			expect(wrapper.find("input[type='checkbox']").exists()).to.be.true;
			expect(wrapper.find("input[type='checkbox']").element.checked).to.be.true;

			// Check for select field
			expect(wrapper.find(fieldSelect).exists()).to.be.true;
			const selectWrapper = wrapper.find(fieldSelect);
			expect(selectWrapper.find("select").exists()).to.be.true;
			expect(selectWrapper.find("select").element.value).to.equal("User");
			// Find options specifically within the core select component
			expect(selectWrapper.findAll("select option").length).to.equal(4);

			// Check for textArea field
			expect(wrapper.find(fieldTextArea).exists()).to.be.true;
			expect(wrapper.find("textarea").exists()).to.be.true;
			expect(wrapper.find("textarea").element.value).to.equal("Some\nMultiline\nNotes");
			expect(wrapper.find("textarea").attributes("rows")).to.equal("4");

			// Check for checklist field
			expect(wrapper.find(fieldChecklist).exists()).to.be.true;
			const checklistWrapper = wrapper.find(fieldChecklist); // Find the component wrapper

			// Find and click the combobox trigger to expand it
			const comboTrigger = checklistWrapper.find(".mainRow");
			expect(comboTrigger.exists()).to.be.true;
			await comboTrigger.trigger("click"); // Simulate click and wait for DOM update

			// Now find inputs within the checklist component
			const checklistInputs = checklistWrapper.findAll("input[type='checkbox']");
			expect(checklistInputs.length).to.equal(3);
			expect(checklistInputs.at(0).element.checked).to.be.true; // Option 1
			expect(checklistInputs.at(1).element.checked).to.be.false; // Option 2
			expect(checklistInputs.at(2).element.checked).to.be.true; // Option 3

			// Check for radios field
			expect(wrapper.find(fieldRadios).exists()).to.be.true;
			const radioInputs = wrapper.findAll("input[type='radio']");
			expect(radioInputs.length).to.equal(3);
			expect(radioInputs.at(0).element.value).to.equal("v1");
			expect(radioInputs.at(0).element.checked).to.be.false;
			expect(radioInputs.at(1).element.value).to.equal("v2");
			expect(radioInputs.at(1).element.checked).to.be.true;
			expect(radioInputs.at(2).element.value).to.equal("v3");
			expect(radioInputs.at(2).element.checked).to.be.false;

			// Check for label field
			expect(wrapper.find(fieldLabel).exists()).to.be.true;
			// Check if the label component renders the model value
			expect(wrapper.find(fieldLabel).text()).to.contain("This is some static info");

			// Check for upload field
			expect(wrapper.find(fieldUpload).exists()).to.be.true;
			// Basic check for an input within the upload component
			expect(wrapper.find(fieldUpload).find("input").exists()).to.be.true;

			// Check for cleave field
			expect(wrapper.find(fieldCleave).exists()).to.be.true;
			// Basic check for an input within the cleave component
			const cleaveInput = wrapper.find(fieldCleave).find("input[type='text']");
			expect(cleaveInput.exists()).to.be.true;

			// Check for datetime picker field
			expect(wrapper.find(fieldDateTimePicker).exists()).to.be.true;
			// Basic check for an input within the component
			const dateTimeInput = wrapper.find(fieldDateTimePicker).find("input[type='text']");
			expect(dateTimeInput.exists()).to.be.true;

			// Check for google address field
			expect(wrapper.find(fieldGoogleAddress).exists()).to.be.true;
			// Basic check for an input within the component
			const googleInput = wrapper.find(fieldGoogleAddress).find("input[type='text']");
			expect(googleInput.exists()).to.be.true;

			// Check for image field
			expect(wrapper.find(fieldImage).exists()).to.be.true;
			// Basic check for an input (type=file) and potentially an img preview
			expect(wrapper.find(fieldImage).find("input[type='file']").exists()).to.be.true;

			// Check for masked field
			expect(wrapper.find(fieldMasked).exists()).to.be.true;
			const maskedInput = wrapper.find(fieldMasked).find("input[type='text']");
			expect(maskedInput.exists()).to.be.true;

			// Check for pikaday field
			expect(wrapper.find(fieldPikaday).exists()).to.be.true;
			const pikadayInput = wrapper.find(fieldPikaday).find("input[type='text']");
			expect(pikadayInput.exists()).to.be.true;

			// Check for selectEx field
			expect(wrapper.find(fieldSelectEx).exists()).to.be.true;
			// Basic check for a select element within the component
			const selectExElement = wrapper.find(fieldSelectEx).find("select");
			expect(selectExElement.exists()).to.be.true;

			// Check for spectrum field
			expect(wrapper.find(fieldSpectrum).exists()).to.be.true;
			// Basic check for an input element within the component
			const spectrumInput = wrapper.find(fieldSpectrum).find("input[type='text']");
			expect(spectrumInput.exists()).to.be.true;

			// Check for noUiSlider field
			expect(wrapper.find(fieldNoUiSlider).exists()).to.be.true;
			// Basic check for the slider div within the component
			expect(wrapper.find(fieldNoUiSlider).find("div.slider").exists()).to.be.true;

			// Check for submit field
			expect(wrapper.find(fieldSubmit).exists()).to.be.true;
			const submitButton = wrapper.find("input[type='submit']");
			expect(submitButton.exists()).to.be.true;
			expect(submitButton.attributes("value")).to.equal("Register");
		}

		console.log("Minimal test completed with ALL core and optional fields.");
	});
});
