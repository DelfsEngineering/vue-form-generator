import { get as objGet, isFunction, isArray, isNil } from "lodash";

/**
 * Resolves the items array for iteration from either a string path or function
 * @param {string|Function} items - String path to array or function returning array
 * @param {Object} model - The root model object
 * @param {Object} options - Form options (for devMode)
 * @returns {Array} The resolved items array, or empty array if invalid
 */
export const resolveIterationItems = (items, model, options = {}) => {
	let result;

	// Handle null/undefined
	if (isNil(items)) {
		return [];
	}

	// Handle function
	if (isFunction(items)) {
		result = items(model);
	}
	// Handle string path
	else if (typeof items === "string") {
		result = objGet(model, items);
	}
	// Unknown type
	else {
		if (options.devMode) {
			console.warn(`[vue-form-generator] iterate.items should be a string path or function, got ${typeof items}`);
		}
		return [];
	}

	// Validate result is an array
	if (isNil(result)) {
		return [];
	}

	if (!isArray(result)) {
		if (options.devMode) {
			console.warn(
				`[vue-form-generator] iterate.items resolved to non-array value (${typeof result}), expected array. Path: ${items}`
			);
		}
		return [];
	}

	return result;
};

/**
 * Generates a Vue :key value for an iteration item
 * @param {*} item - The current iteration item
 * @param {number} index - The current iteration index
 * @param {string|Function|null} keyConfig - Key configuration from iterate.key
 * @returns {*} The key value to use for Vue's :key
 */
export const generateIterationKey = (item, index, keyConfig) => {
	let key;

	// Handle function
	if (isFunction(keyConfig)) {
		key = keyConfig(item, index);
	}
	// Handle string path
	else if (typeof keyConfig === "string") {
		key = objGet(item, keyConfig);
	}

	// Fall back to index if key is null/undefined
	if (isNil(key)) {
		return index;
	}

	return key;
};
