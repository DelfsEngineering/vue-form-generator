module.exports = {
	presets: ["@vue/app"],
	plugins: [
		"lodash",
		"@babel/plugin-proposal-nullish-coalescing-operator",
		"@babel/plugin-proposal-optional-chaining",
		[
			"@babel/plugin-transform-runtime",
			{
				corejs: 3
			}
		]
	]
};
