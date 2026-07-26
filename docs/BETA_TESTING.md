# BETA_TESTING — structured test checklist

For the beta owner and testers. Report every issue via the in-app **Send Feedback** button (bottom-right), quoting the version from the footer (e.g. "Beta v0.1.0"). The app is client-only: all data stays in your browser's local storage.

## 1. Core journey (run on every new version)

- [ ] Open the beta URL → (if gated) enter the access code → app loads with no console errors.
- [ ] Accept or edit **Daily Targets**; try **Calculate My Targets** (age/sex/height/weight/activity/goal) and apply the estimate.
- [ ] **Breakfast:** pick a base ingredient → recipes appear → open **View Recipe** → check ingredients, method and the **Nutrition data sources** panel → **Add to Meal Plan**.
- [ ] Repeat for **Lunch**, **Dinner**, **Night-Time Snack** (use different base ingredients).
- [ ] Adjust a portion (0.5×–4× and **Adjust to Fit My Targets**) — macros scale correctly everywhere.
- [ ] **Daily Summary:** all four meals listed; macro dashboard, micronutrient dashboard and balance score render; recommendations appear.
- [ ] **Optimise My Meal Plan** → proposals appear → apply one → totals update.
- [ ] **Shopping list:** ingredients merged and grouped; tick items; copy/download/print work.
- [ ] **Save plan** → name it → reload the page → plan, targets and favourites persist → load the saved plan.

## 2. Nutrition Support Modes

For **each** of PCOS / Endometriosis / Menopause:
- [ ] Select the mode from **Nutrition Support Mode**; card, disclaimer and Research Methodology open correctly.
- [ ] Ingredient cards show 🔬 evidence badges; open an **evidence panel** — outcomes are graded A–D with category chips, and "what this does not prove" is present.
- [ ] Recipe cards show a categorical **relevance** label (never a score presented as clinical).
- [ ] Complete a full day → condition **dashboard** renders (fibre, protein distribution, oily fish, etc.).
- [ ] Open the **Supplement Evidence Centre** and **Research Centre**; filter by outcome and evidence level; open a **Research Details** view — null findings are visible; references are clickable and resolve to PubMed/DOI pages.
- [ ] Switch back to **General Nutrition** — condition UI disappears, planner still works.
- [ ] Confirm wording nowhere claims to diagnose, treat, cure or "balance hormones".

## 3. Different user profiles

- [ ] Calculator: male and female; ages 18 / 45 / 70; very low (1,200) and very high (4,000+) calorie targets; high protein target (250 g).
- [ ] Dietary filters: vegetarian, vegan, pescatarian, gluten-free, dairy-free, nut-free — each returns only compliant recipes (spot-check ingredients against tags).
- [ ] Allergy-driven exclusion: as a nut-allergic user, filter nut-free and verify no nut ingredients appear in any chosen recipe.
- [ ] Prep-time buckets and calorie/protein range sliders behave sensibly.
- [ ] Mobile (~375 px): full core journey; dashboards readable; evidence panels scroll inside themselves; no horizontal page scroll.
- [ ] Desktop: full core journey; keyboard-only pass (Tab/Enter/Esc) through one complete plan; Esc closes every modal.

## 4. Failure & abuse testing

- [ ] Invalid targets: 0 / negative / absurd values in every number field — app clamps or rejects without crashing.
- [ ] Custom portion: 0, 9999, letters — validation message, no crash.
- [ ] Empty states: search an ingredient with no recipes; stack all filters until "No recipes match" appears — hint text shows.
- [ ] Refresh mid-journey (each step) — progress persists.
- [ ] Browser back/forward — app remains usable (hash routing).
- [ ] Repeat plan-building 5+ times in one session — no slowdown or duplicated state.
- [ ] Offline/slow network (DevTools): app still works fully — recipes and nutrition are local; only branded-food search (Open Food Facts) may fail, and it should fail quietly without breaking the planner.
- [ ] Private-browsing mode (storage restricted) — warning appears, session still usable.
- [ ] Print a plan — print view is clean (no buttons/nav).
- [ ] `#authoring` URL — must NOT load the authoring tool on the deployed beta.

## 5. Data honesty spot-checks (owner)

- [ ] A calculated recipe's provenance rows match its stated ingredients/gram weights.
- [ ] A partial-nutrient recipe shows "partial/lower-bound" language, not fake precision.
- [ ] The two authored recipes (prawn noodle salad, hummus flatbread) display without a provenance panel and without errors.

## Reporting template for testers

> **Version:** (footer, e.g. Beta v0.1.0) · **Device/browser:** · **Steps:** · **Expected:** · **Actual:** — submit via Send Feedback.
