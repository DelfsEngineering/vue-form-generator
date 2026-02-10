import Vue from "vue";
let VueFormGenerator = require("vue-form-generator");
if (VueFormGenerator.default) {
	VueFormGenerator = VueFormGenerator.default;
}

const { fieldInput, fieldSelect, fieldSubmit, fieldTextArea, fieldErrorSummary } = VueFormGenerator.fieldsLoader;

Vue.use(VueFormGenerator, {
	fields: [fieldInput, fieldSelect, fieldSubmit, fieldTextArea, fieldErrorSummary]
});

import VueHighlightJS from "vue-highlightjs";
Vue.use(VueHighlightJS);
import App from "./app.vue";

new Vue({ render: (h) => h(App) }).$mount("#app");


