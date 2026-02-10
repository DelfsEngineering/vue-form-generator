import Vue from "vue";

let VueFormGenerator = require("vue-form-generator");
// Fix between local and exported project
if (VueFormGenerator.default) {
	VueFormGenerator = VueFormGenerator.default;
}

const { fieldInput, fieldSubmit } = VueFormGenerator.fieldsLoader;

Vue.use(VueFormGenerator, {
	fields: [fieldInput, fieldSubmit]
});

import App from "./app.vue";

new Vue({
	render: (h) => h(App)
}).$mount("#app");

