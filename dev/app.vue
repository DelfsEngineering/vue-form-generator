<template>
	<div class="container">
		<h1>Dev Project</h1>
		<ul>
			<li v-for="link in devProject" :key="link">
				<a :href="'/' + link" v-text="link"></a>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	name: "index",
	data() {
		return {
			// Reverted: // Use the list injected by DefinePlugin in vue.config.js
			// Reverted: devProject: JSON.parse(process.env.AVAILABLE_PROJECTS || '[]')
			devProject: (() => {
				const list = JSON.parse(process.env.VUE_APP_DEV_PROJECT || "[]");
				const normalized = Array.isArray(list) ? [...list] : [];
				if (!normalized.includes("error-summary-demo")) normalized.push("error-summary-demo");
				if (!normalized.includes("content-field")) normalized.push("content-field");
				if (!normalized.includes("invalid-schema")) normalized.push("invalid-schema");
				if (!normalized.includes("group-iterate-photos")) normalized.push("group-iterate-photos");
				if (!normalized.includes("group-iterate-nested")) normalized.push("group-iterate-nested");
				return normalized;
			})() // Ensure new demos are listed
		};
	}
};
</script>

<style lang="scss">
@use "./style.scss";
</style>
