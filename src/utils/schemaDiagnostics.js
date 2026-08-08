import { get as objGet, isNil } from "lodash";
import Vue from "vue";

export const REASON = {
	NULL_ENTRY: "null_entry",
	BAD_ENTRY_TYPE: "bad_entry_type",
	MISSING_TYPE: "missing_type",
	UNKNOWN_TYPE: "unknown_type",
	BAD_VALIDATOR: "bad_validator",
	UNUSABLE: "unusable_field"
};

const BUILTIN_SCHEMA_TYPES = {
	group: true,
	content: true
};

const MAX_SNIPPET_LENGTH = 2000;
const MAX_STRING_VALUE_LENGTH = 120;

const warnedPaths = Object.create(null);

export function resetWarnedDiagnostics() {
	Object.keys(warnedPaths).forEach((key) => {
		delete warnedPaths[key];
	});
}

/**
 * Normalize a schema type to the Vue component tag formElement uses (`field-input`).
 */
export function normalizeFieldComponentName(type) {
	const normalized = String(type || "")
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/\s+/g, "-")
		.toLowerCase();
	return "field-" + normalized;
}

function pascalCaseTag(tag) {
	return String(tag)
		.split("-")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

/**
 * Whether a field `type` resolves to a registered Vue component (or builtin group/content).
 * Pass the app/local Vue constructor when components were registered on createLocalVue().
 */
export function isKnownFieldType(type, vue = Vue) {
	if (isNil(type) || type === "") {
		return false;
	}
	if (BUILTIN_SCHEMA_TYPES[type]) {
		return true;
	}

	const tag = normalizeFieldComponentName(type);
	const pascal = pascalCaseTag(tag);
	const registries = [];

	if (vue && vue.options && vue.options.components) {
		registries.push(vue.options.components);
	}
	// Also check global Vue when a local Vue constructor was passed
	if (vue !== Vue && Vue.options && Vue.options.components) {
		registries.push(Vue.options.components);
	}

	return registries.some((components) => !!(components[tag] || components[pascal]));
}

/**
 * Resolve from a live component instance (walks local components + ctor options).
 */
export function isKnownFieldTypeForVm(type, vm) {
	if (isNil(type) || type === "") {
		return false;
	}
	if (BUILTIN_SCHEMA_TYPES[type]) {
		return true;
	}

	const tag = normalizeFieldComponentName(type);
	const pascal = pascalCaseTag(tag);

	let current = vm;
	while (current) {
		const local = current.$options && current.$options.components;
		if (local && (local[tag] || local[pascal])) {
			return true;
		}
		current = current.$parent;
	}

	const ctor = vm && vm.$root && vm.$root.constructor;
	if (ctor && isKnownFieldType(type, ctor)) {
		return true;
	}

	return isKnownFieldType(type, Vue);
}

function collapseValue(value) {
	if (typeof value === "string" && value.length > MAX_STRING_VALUE_LENGTH) {
		return `…(${value.length} chars)…`;
	}
	if (Array.isArray(value)) {
		return value.map(collapseValue);
	}
	if (value && typeof value === "object") {
		const out = {};
		Object.keys(value).forEach((key) => {
			out[key] = collapseValue(value[key]);
		});
		return out;
	}
	return value;
}

/**
 * Safe, capped JSON snippet of a single bad field entry (not the whole schema).
 */
export function formatSnippet(field) {
	if (field === null) {
		return "null";
	}
	if (typeof field === "undefined") {
		return "undefined";
	}
	if (typeof field !== "object") {
		try {
			return JSON.stringify(field);
		} catch (e) {
			return String(field);
		}
	}

	try {
		let snippet = JSON.stringify(collapseValue(field), null, 2);
		if (snippet.length > MAX_SNIPPET_LENGTH) {
			snippet = snippet.slice(0, MAX_SNIPPET_LENGTH) + "…";
		}
		return snippet;
	} catch (e) {
		return "[unserializable field]";
	}
}

export function reasonCodeForField(field, vueOrVm = Vue) {
	if (isNil(field)) {
		return REASON.NULL_ENTRY;
	}
	if (typeof field !== "object") {
		return REASON.BAD_ENTRY_TYPE;
	}
	if (isNil(field.type)) {
		return REASON.MISSING_TYPE;
	}

	const known =
		vueOrVm && vueOrVm._isVue ? isKnownFieldTypeForVm(field.type, vueOrVm) : isKnownFieldType(field.type, vueOrVm);

	if (!known) {
		return REASON.UNKNOWN_TYPE;
	}
	return REASON.UNUSABLE;
}

export function buildFieldDiagnostic({ field, index, path, reason, options = {}, vue, vm } = {}) {
	const resolver = vm || vue || Vue;
	const resolvedReason = reason || reasonCodeForField(field, resolver);
	const isObject = field && typeof field === "object";

	return {
		path: path || `fields[${index}]`,
		index,
		reason: resolvedReason,
		type: isObject ? field.type : undefined,
		model: isObject ? field.model : undefined,
		label: isObject ? field.label : undefined,
		snippet: formatSnippet(field),
		devMode: !!objGet(options, "devMode", false)
	};
}

export function warnFieldDiagnostic(diagnostic) {
	if (!diagnostic || !diagnostic.path) {
		return;
	}
	if (warnedPaths[diagnostic.path]) {
		return;
	}
	warnedPaths[diagnostic.path] = true;

	const message = `[vue-form-generator] Invalid field at ${diagnostic.path} (${diagnostic.reason}). Ensure each entry is an object with a valid "type".`;
	console.warn(message, diagnostic);
}
