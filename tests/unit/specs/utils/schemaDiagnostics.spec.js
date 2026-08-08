/* eslint no-undefined: 0 */
import {
	REASON,
	formatSnippet,
	buildFieldDiagnostic,
	warnFieldDiagnostic,
	resetWarnedDiagnostics,
	isKnownFieldType,
	normalizeFieldComponentName
} from "@/utils/schemaDiagnostics";

describe("schemaDiagnostics", () => {
	describe("normalizeFieldComponentName / isKnownFieldType", () => {
		it("normalizes camelCase types to field-* tags", () => {
			expect(normalizeFieldComponentName("dateTimePicker")).to.equal("field-date-time-picker");
			expect(normalizeFieldComponentName("input")).to.equal("field-input");
		});

		it("treats group and content as built-in known types", () => {
			expect(isKnownFieldType("group")).to.be.true;
			expect(isKnownFieldType("content")).to.be.true;
		});

		it("detects registered Vue components by kebab or Pascal name", () => {
			const vue = {
				options: {
					components: {
						"field-input": {},
						FieldChecklist: {}
					}
				}
			};
			expect(isKnownFieldType("input", vue)).to.be.true;
			expect(isKnownFieldType("checklist", vue)).to.be.true;
			expect(isKnownFieldType("definitelyNotRegistered", vue)).to.be.false;
		});
	});

	describe("formatSnippet", () => {
		it("formats null as the string null", () => {
			expect(formatSnippet(null)).to.equal("null");
		});

		it("formats undefined as the string undefined", () => {
			expect(formatSnippet(undefined)).to.equal("undefined");
		});

		it("formats an empty object", () => {
			expect(formatSnippet({})).to.equal("{}");
		});

		it("includes type and model for a normal field object", () => {
			const snippet = formatSnippet({ type: "input", model: "email", label: "Email" });
			expect(snippet).to.contain('"type": "input"');
			expect(snippet).to.contain('"model": "email"');
			expect(snippet).to.contain('"label": "Email"');
		});

		it("collapses large html strings so snippets stay readable", () => {
			const hugeHtml = "<div>" + "x".repeat(5000) + "</div>";
			const snippet = formatSnippet({ type: "html", html: hugeHtml, model: "body" });
			expect(snippet.length).to.be.below(2500);
			expect(snippet).to.contain("chars");
			expect(snippet).to.contain('"type": "html"');
			expect(snippet).not.to.contain("x".repeat(100));
		});
	});

	describe("buildFieldDiagnostic", () => {
		it("builds a diagnostic with path, reason code, and snippet for null entries", () => {
			const diagnostic = buildFieldDiagnostic({
				field: null,
				index: 0,
				path: "root.fields[0]",
				reason: REASON.NULL_ENTRY,
				options: { devMode: true }
			});

			expect(diagnostic.path).to.equal("root.fields[0]");
			expect(diagnostic.index).to.equal(0);
			expect(diagnostic.reason).to.equal(REASON.NULL_ENTRY);
			expect(diagnostic.snippet).to.equal("null");
			expect(diagnostic.devMode).to.be.true;
			expect(diagnostic.type).to.equal(undefined);
			expect(diagnostic.model).to.equal(undefined);
			expect(diagnostic.label).to.equal(undefined);
		});

		it("includes type, model, and label when present", () => {
			const diagnostic = buildFieldDiagnostic({
				field: { type: "input", model: "name", label: "Name" },
				index: 2,
				path: "root.fields[2]",
				reason: REASON.UNKNOWN_TYPE,
				options: { devMode: false }
			});

			expect(diagnostic.type).to.equal("input");
			expect(diagnostic.model).to.equal("name");
			expect(diagnostic.label).to.equal("Name");
			expect(diagnostic.devMode).to.be.false;
			expect(diagnostic.snippet).to.contain('"type": "input"');
		});

		it("uses missing_type reason for empty objects", () => {
			const diagnostic = buildFieldDiagnostic({
				field: {},
				index: 1,
				path: "root.fields[1]",
				reason: REASON.MISSING_TYPE,
				options: {}
			});

			expect(diagnostic.reason).to.equal(REASON.MISSING_TYPE);
			expect(diagnostic.snippet).to.equal("{}");
		});
	});

	describe("warnFieldDiagnostic", () => {
		let warnSpy;

		beforeEach(() => {
			resetWarnedDiagnostics();
			warnSpy = sinon.spy(console, "warn");
		});

		afterEach(() => {
			warnSpy.restore();
			resetWarnedDiagnostics();
		});

		it("logs once per path with message and diagnostic object", () => {
			const diagnostic = buildFieldDiagnostic({
				field: null,
				index: 0,
				path: "root.fields[0]",
				reason: REASON.NULL_ENTRY,
				options: { devMode: false }
			});

			warnFieldDiagnostic(diagnostic);
			warnFieldDiagnostic(diagnostic);

			expect(warnSpy.calledOnce).to.be.true;
			expect(warnSpy.firstCall.args[0]).to.contain("[vue-form-generator]");
			expect(warnSpy.firstCall.args[0]).to.contain("root.fields[0]");
			expect(warnSpy.firstCall.args[0]).to.contain(REASON.NULL_ENTRY);
			expect(warnSpy.firstCall.args[1]).to.include({
				path: "root.fields[0]",
				reason: REASON.NULL_ENTRY,
				snippet: "null"
			});
		});

		it("logs again for a different path", () => {
			warnFieldDiagnostic(
				buildFieldDiagnostic({
					field: null,
					index: 0,
					path: "root.fields[0]",
					reason: REASON.NULL_ENTRY,
					options: {}
				})
			);
			warnFieldDiagnostic(
				buildFieldDiagnostic({
					field: {},
					index: 1,
					path: "root.fields[1]",
					reason: REASON.MISSING_TYPE,
					options: {}
				})
			);

			expect(warnSpy.calledTwice).to.be.true;
		});
	});
});
