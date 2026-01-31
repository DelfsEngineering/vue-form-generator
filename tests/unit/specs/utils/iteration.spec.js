/* eslint no-undefined: 0 */
import { resolveIterationItems, generateIterationKey } from "@/utils/iteration";

describe("IterationUtils", () => {
	describe("resolveIterationItems", () => {
		it("should resolve string path to array", () => {
			const model = {
				cards: [
					{ id: 1, title: "Card A" },
					{ id: 2, title: "Card B" }
				]
			};
			const result = resolveIterationItems("cards", model);
			expect(result).to.deep.equal([
				{ id: 1, title: "Card A" },
				{ id: 2, title: "Card B" }
			]);
		});

		it("should resolve nested path", () => {
			const model = {
				data: {
					cards: [{ id: 1, title: "Card A" }]
				}
			};
			const result = resolveIterationItems("data.cards", model);
			expect(result).to.deep.equal([{ id: 1, title: "Card A" }]);
		});

		it("should call function with model", () => {
			const model = {
				cards: [
					{ id: 1, active: true },
					{ id: 2, active: false },
					{ id: 3, active: true }
				]
			};
			const fn = (rootModel) => rootModel.cards.filter((c) => c.active);
			const result = resolveIterationItems(fn, model);
			expect(result).to.deep.equal([
				{ id: 1, active: true },
				{ id: 3, active: true }
			]);
		});

		it("should return empty array for null/undefined items", () => {
			expect(resolveIterationItems(null, {})).to.deep.equal([]);
			expect(resolveIterationItems(undefined, {})).to.deep.equal([]);
		});

		it("should return empty array for missing path", () => {
			const model = { cards: [] };
			const result = resolveIterationItems("missing", model);
			expect(result).to.deep.equal([]);
		});

		it("should return empty array for non-array value", () => {
			const model = { name: "string value" };
			const result = resolveIterationItems("name", model);
			expect(result).to.deep.equal([]);
		});

		it("should warn in dev mode for non-array value", () => {
			const warnSpy = sinon.spy(console, "warn");
			const model = { name: "string value" };

			resolveIterationItems("name", model, { devMode: true });

			expect(warnSpy.calledOnce).to.be.true;
			expect(warnSpy.firstCall.args[0]).to.include("expected array");

			warnSpy.restore();
		});

		it("should not warn in production mode for non-array value", () => {
			const warnSpy = sinon.spy(console, "warn");
			const model = { name: "string value" };

			resolveIterationItems("name", model, { devMode: false });

			expect(warnSpy.called).to.be.false;

			warnSpy.restore();
		});

		it("should handle function returning null", () => {
			const fn = () => null;
			const result = resolveIterationItems(fn, {});
			expect(result).to.deep.equal([]);
		});

		it("should handle function returning non-array", () => {
			const warnSpy = sinon.spy(console, "warn");
			const fn = () => "not an array";

			const result = resolveIterationItems(fn, {}, { devMode: true });

			expect(result).to.deep.equal([]);
			expect(warnSpy.calledOnce).to.be.true;

			warnSpy.restore();
		});
	});

	describe("generateIterationKey", () => {
		it("should use string key path", () => {
			const item = { id: 42, name: "Test" };
			const key = generateIterationKey(item, 0, "id");
			expect(key).to.equal(42);
		});

		it("should use nested key path", () => {
			const item = {
				metadata: {
					uuid: "abc-123"
				}
			};
			const key = generateIterationKey(item, 0, "metadata.uuid");
			expect(key).to.equal("abc-123");
		});

		it("should handle deep nested paths", () => {
			const item = {
				data: {
					user: {
						profile: {
							id: "deep-id"
						}
					}
				}
			};
			const key = generateIterationKey(item, 0, "data.user.profile.id");
			expect(key).to.equal("deep-id");
		});

		it("should call function key with item and index", () => {
			const item = { id: 5, name: "Item" };
			const keyFn = (item, index) => `item-${item.id}-${index}`;
			const key = generateIterationKey(item, 3, keyFn);
			expect(key).to.equal("item-5-3");
		});

		it("should default to index when no key provided", () => {
			const item = { id: 5 };
			const key = generateIterationKey(item, 7, null);
			expect(key).to.equal(7);
		});

		it("should default to index when key is undefined", () => {
			const item = { id: 5 };
			const key = generateIterationKey(item, 7, undefined);
			expect(key).to.equal(7);
		});

		it("should handle missing nested path", () => {
			const item = { id: 1 };
			const key = generateIterationKey(item, 3, "metadata.uuid");
			// Should fall back to index when path doesn't exist
			expect(key).to.equal(3);
		});

		it("should handle function returning null", () => {
			const item = { id: 1 };
			const keyFn = () => null;
			const key = generateIterationKey(item, 5, keyFn);
			// Should fall back to index when function returns null
			expect(key).to.equal(5);
		});

		it("should handle function returning undefined", () => {
			const item = { id: 1 };
			const keyFn = () => undefined;
			const key = generateIterationKey(item, 5, keyFn);
			// Should fall back to index when function returns undefined
			expect(key).to.equal(5);
		});

		it("should handle various key types", () => {
			// String key
			expect(generateIterationKey({ id: "abc" }, 0, "id")).to.equal("abc");
			// Number key
			expect(generateIterationKey({ id: 123 }, 0, "id")).to.equal(123);
			// Boolean key (unusual but valid)
			expect(generateIterationKey({ active: true }, 0, "active")).to.equal(true);
		});
	});
});
