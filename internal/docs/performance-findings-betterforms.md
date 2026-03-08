# Performance Findings for BetterForms Usage

## Goal
Capture the main performance and packaging conclusions from the BetterForms-focused review of VFG, so future work can start from the refined context instead of generic library assumptions.

## Status
Investigation complete. No implementation in this document.

## BetterForms Context
- BetterForms is not a simple static form app. Developers build page/app schemas through a UI.
- Many rendered nodes are not traditional form inputs:
  - layout containers
  - `html`
  - `bfcomponent`
  - tabs/groups/custom wrappers
  - builder/editor utility controls
- Only a subset of nodes on many pages are true user-input fields that actually need validation.
- Some BetterForms custom fields host nested VFG rendering surfaces, so they act more like containers than leaf controls.

## Important Framing
- Advice for a generic npm form library does not always map cleanly to BetterForms.
- In particular, "split all fields out of the main bundle" is not automatically the right answer, because BetterForms supports dynamic schema-driven page composition where field usage is not known ahead of time.
- The best optimizations are the ones that respect that dynamic-builder architecture.

## Top 3 Recommended Optimizations

### 1. Listener Hygiene in Validation and Submit Flows
This is the best balance of payoff, safety, and compatibility.

Why it ranks first:
- low architectural risk
- preserves current event model
- reduces risk of repeated callbacks in long-lived editor sessions
- easier to test than validation redesign

Primary code areas:
- `src/formGenerator.vue`
- `src/fields/core/fieldSubmit.vue`

Observed issues:
- transient listeners are attached inside validation/submit flows
- anonymous listeners make cleanup difficult
- repeated validation/submit activity can accumulate stale listeners

Recommended scope:
- replace anonymous transient listeners with named handlers
- remove them in a single cleanup path
- consider `$once` where semantics are truly one-shot
- preserve all current event names and lifecycle behavior

Compatibility assessment:
- high, if treated strictly as listener hygiene
- medium risk only if event timing/semantics are changed

### 2. Narrow Whole-Model Watchers on Optional/Heavy Fields
Several optional fields watch the entire `model`, which means unrelated form changes can refresh expensive widgets.

Why it ranks second:
- practical win in BetterForms pages that contain many non-input nodes
- avoids unnecessary work when only a small subsection of the page changes
- incremental change, not architectural redesign

Primary likely candidates:
- `fieldSelectEx`
- `fieldImage`
- `fieldSpectrum`
- `fieldRangeSlider`
- `fieldNoUiSlider`

Recommended scope:
- watch field-specific value/path instead of the entire `model`
- refresh third-party widgets only when their own bound value changes

Compatibility assessment:
- generally high
- test carefully where widgets depend on non-local model state

### 3. Lazy-Load Heavy Optional Field Families
For BetterForms, the more realistic size/perf strategy is not "remove unknown fields from the product bundle," but "keep a core runtime and lazy-load heavier optional field families when first used."

Why it ranks third:
- fits dynamic schema-driven rendering better than classic tree-shaking advice
- reduces initial JS cost without requiring compile-time knowledge of schema contents
- offers a middle ground between full monolith and over-fragmented packaging

Good candidates:
- multiselect
- date/time picker families
- slider/range widgets
- spectrum/image-type extras
- map-like integrations

Recommended scope:
- keep core/common fields eagerly available
- load heavy/rare field families asynchronously when schema first references them
- provide loading/fallback behavior for first use

Compatibility assessment:
- medium
- useful, but larger than the first two optimizations

## What Dropped Out of the Top 3

### Full Validation Architecture Refactor
Example idea:
- replace event-bus validation fanout with a direct field registry
- distinguish passive nodes, leaf validatable nodes, and container nodes
- explicitly support nested validation surfaces for custom BetterForms fields

Why it is **not** a near-term recommendation:
- this is a significant architectural change
- BetterForms custom fields can host nested VFG render surfaces
- naive "only validate fields with validators" logic would be too simplistic
- high compatibility risk if lifecycle expectations change

Conclusion:
- potentially valuable long term
- not low-hanging fruit
- defer unless profiling shows validation orchestration is a major bottleneck in real usage

## Validation Hot Path: Practical Interpretation
- If most pages do **not** call `validate()`, do not use `validateAfterChanged`, and do not frequently trigger submit-driven validation, then the full validation hot-path cost is mostly dormant.
- That means validation architecture is not necessarily a constant runtime tax on every BetterForms page.
- However, listener hygiene issues can still matter in long-lived sessions or repeated submit/validate scenarios.

## Bundle-Size Findings Reinterpreted for BetterForms
- Generic library advice said eager field imports were a major size issue.
- For BetterForms specifically, shipping a broad base runtime is understandable because the rendered schema is user-authored and open-ended.
- Therefore:
  - a full/default build still makes sense
  - runtime-focused optimizations are likely more valuable than aggressive field splitting
  - optional lazy loading remains attractive for heavier field families

## Safe vs Risky Work

### Safe / Incremental
- listener cleanup in validation/submit flows
- remove debug logging in hot paths
- narrow whole-model watchers
- reduce repeated expensive option normalization
- small render-path caching where semantics are clearly preserved

### Risky / Architectural
- redesign validation orchestration
- classify fields into passive/leaf/container roles
- formal nested validation ownership model for custom BetterForms fields
- broad event lifecycle changes

## Future Session Starting Point
If resuming this work later, start in this order:

1. Audit listener accumulation in `formGenerator.validate()` and `fieldSubmit.onClick()`.
2. Audit optional field watchers that depend on full-model changes.
3. Identify heavy optional field families that are good lazy-load candidates.
4. Only then revisit whether validation architecture overhaul is justified.

## Summary
- BetterForms context changes the prioritization.
- The best next optimization is **listener hygiene**, not validation redesign.
- The second best is **narrowing whole-model watchers**.
- The third best is **lazy-loading heavy optional field families**.
- The event-bus validation redesign remains a future architectural discussion, not a near-term optimization task.

