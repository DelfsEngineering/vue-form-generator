<template>
	<div class="container">
		<h1>Invalid Schema Demo</h1>
		<p class="lead">
			This example feeds VFG a schema that contains an invalid entry (a <code>null</code> in the fields array).
			With <code>devMode: true</code>, the form renders a visible warning block and logs a console warning instead of throwing.
			Valid fields continue to render normally.
		</p>

		<div class="row">
			<div class="col-sm-12">
				<vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>
			</div>
		</div>

		<div class="row" style="margin-top: 16px">
			<div class="col-sm-12">
				<div class="panel panel-default">
					<div class="panel-heading">What to look for</div>
					<div class="panel-body">
						<ul>
							<li>Inline warning block where the invalid field would render.</li>
							<li>Open the browser console to see the warning with index and hint.</li>
							<li>The valid field below the warning still renders and works.</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			model: {
				name: "Ada Lovelace"
			},
			schema: {
				fields: [
					null, // Intentional invalid entry to trigger inline warning/console hint
					{
						type: "input",
						model: "name",
						label: "Valid field still renders",
						fieldOptions: {
							inputType: "text"
						}
					}
				]
			},
			formOptions: {
				validateAfterLoad: false,
				validateAfterChanged: false,
				devMode: true
			}
		};
	}
};
</script>

<style lang="scss">
@use "../../style.scss" as *;

.panel {
	margin-bottom: 0;
}
</style>

