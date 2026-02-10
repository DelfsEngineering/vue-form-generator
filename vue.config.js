const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const version = require("./package.json").version;
const banner = `
/**
 * vue-form-generator ${version}
 * https://github.com/vue-generators/vue-form-generator/
 * Released under the MIT License.
 */
`;

const generateDevProjects = () => {
	const projectRoot = path.resolve(__dirname, "dev/projects");
	const envProjects = JSON.parse(process.env.VUE_APP_DEV_PROJECT || "[]");

	// Normalize to array
	const devProjects = Array.isArray(envProjects) ? [...envProjects] : [];

	// Ensure new demos are available even if not listed in env
	if (!devProjects.includes("error-summary-demo")) devProjects.push("error-summary-demo");
	if (!devProjects.includes("content-field")) devProjects.push("content-field");
	if (!devProjects.includes("invalid-schema")) devProjects.push("invalid-schema");
	if (!devProjects.includes("group-iterate-photos")) devProjects.push("group-iterate-photos");
	if (!devProjects.includes("group-iterate-nested")) devProjects.push("group-iterate-nested");

	// Filter out projects that no longer exist (e.g., removed demos)
	const existingProjects = devProjects.filter((projectName) =>
		fs.existsSync(path.join(projectRoot, projectName, "main.js"))
	);

	let devConfig = {
		index: {
			entry: "./dev/index.js",
			title: "vue-form-generator index"
		}
	};

	existingProjects.forEach((projectName) => {
		devConfig[projectName] = {
			entry: `./dev/projects/${projectName}/main.js`,
			template: `./dev/projects/${projectName}/index.html`,
			filename: `${projectName}/index.html`,
			title: `vue-form-generator ${projectName} demo`
		};
	});

	return devConfig;
};

// Reverted: const { pages, projectNames } = generateDevProjects();

module.exports = {
	publicPath: process.env.NODE_ENV === "production" ? "" : "/",
	outputDir: process.env.NODE_ENV === "production" ? "dist" : path.resolve("dev/projects"),
	lintOnSave: true,
	runtimeCompiler: false,
	transpileDependencies: [],
	productionSourceMap: false,
	// pages: pages, // Reverted
	pages: process.env.NODE_ENV !== "development" ? {} : generateDevProjects(), // Reverted: Original dynamic pages config
	chainWebpack: (config) => {
		config.resolve.alias.set("vue-form-generator", path.resolve(__dirname, "src")); // <-- Restore this alias

		// Reverted: config.plugin('define').tap(args => {
		// Reverted: 	args[0]['process.env.AVAILABLE_PROJECTS'] = JSON.stringify(projectNames);
		// Reverted: 	return args;
		// Reverted: });

		if (process.env.NODE_ENV === "production") {
			config.plugin("banner").use(webpack.BannerPlugin, [
				{
					banner,
					raw: true,
					entryOnly: true
				}
			]);
		}
	},
	css: {
		loaderOptions: {
			sass: {}
		}
	},
	devServer: {
		allowedHosts: "all",
		host: "0.0.0.0",
		port: 8080,
		static: {
			directory: path.resolve("dev/projects")
		},
		client: {
			webSocketURL: "auto://0.0.0.0:8080/ws"
		}
	},
	configureWebpack: {
		// Some environments can hit source-map-support recursion during mochapack startup
		// when the bundle is large. Disabling source maps for unit tests keeps output stable.
		...(process.env.NODE_ENV === "test" ? { devtool: false } : {}),
		node: false
	}
};
