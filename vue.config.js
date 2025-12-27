const path = require("path");
// const fs = require("fs"); // Reverted
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
	// Reverted: const projectRoot = path.resolve(__dirname, "dev/projects");
	// Reverted: const projectNames = fs.readdirSync(projectRoot, { withFileTypes: true })
	// Reverted:		.filter(dirent => dirent.isDirectory())
	// Reverted:		.map(dirent => dirent.name);
	// Reverted: console.log("Detected example projects:", projectNames);

	const devProjects = JSON.parse(process.env.VUE_APP_DEV_PROJECT || "[]"); // Reverted: Restore original env var usage
	// Ensure new demos are available even if not listed in env
	if (Array.isArray(devProjects)) {
		if (!devProjects.includes("error-summary-demo")) devProjects.push("error-summary-demo");
		if (!devProjects.includes("content-field")) devProjects.push("content-field");
		if (!devProjects.includes("invalid-schema")) devProjects.push("invalid-schema");
	}

	let devConfig = {
		index: {
			entry: "./dev/index.js",
			title: "vue-form-generator index"
		}
	};
	// projectNames.forEach((projectName) => { // Reverted
	devProjects.forEach((projectName) => {
		// Reverted: Use original env var list
		devConfig[projectName] = {
			entry: `./dev/projects/${projectName}/main.js`,
			template: `./dev/projects/${projectName}/index.html`,
			filename: `${projectName}/index.html`,
			title: `vue-form-generator ${projectName} demo`
		};
	});
	// Reverted: return {
	// Reverted:    pages: devConfig,
	// Reverted:    projectNames: projectNames
	// Reverted: };
	return devConfig; // Reverted: Return only pages config
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
		node: false
	}
};
