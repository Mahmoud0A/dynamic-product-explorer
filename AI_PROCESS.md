# AI-Assisted Development Process

## Overview
This project was built with AI assistance (Muse Spark via Kilo). AI was used for scaffolding, code generation, and verification guidance; all final decisions, testing, and fixes were verified manually.

## Example 1 — API & Data Understanding

**Prompt:**
> Analyze the DummyJSON API response structure at https://dummyjson.com/products and determine the appropriate TypeScript data models.

**What AI helped with:**
- Fetched `https://dummyjson.com/products?limit=2` and inspected payload.
- Identified relevant fields (`id`, `title`, `description`, `category`, `price`, `thumbnail`, `images`, `total/skip/limit`).
- Proposed `Product` with `image: string` (mapped from `thumbnail`) and `ProductsResponse { products: Product[] }`, plus a separate `RawProduct`/`ApiResponse` for faithful API typing.

**What was verified / decided independently:**
- Confirmed via `Invoke-RestMethod` that `thumbnail` is correct image source, not `images[0]`, and that `price` is `number`.
- Decided to keep `ProductsResponse` as assignment-required wrapper and explicitly use it (`toProductsResponse`) to satisfy both API truth (`ApiResponse` with `RawProduct`) and assignment spec.
- Rejected exposing all raw fields (rating, stock, brand) to keep `Product` minimal per spec.

## Example 2 — Debugging / Root Cause Analysis

**Prompt:**
> Build fails with TS error `ProductsResponse is declared but never used` under `noUnusedLocals`.

**What AI helped with:**
- Diagnosed `strict` + `noUnusedLocals` strictness causing unused type error.
- Suggested using the type (wrapper function returning `ProductsResponse`) rather than disabling the lint flag.

**What was verified / decided independently:**
- Verified `npx tsc --noEmit` error reproduces; tested that a dummy usage (`void wrapped`) satisfies check without changing `tsconfig` semantics.
- Rejected alternative of setting `noUnusedLocals: false` to keep strictness.
- Verified rebuild succeeds (`npm run build`) after fix.

## Example 3 — Code Review

**Prompt:**
> Review implementation for semantic HTML, accessibility, TypeScript correctness, event delegation, and responsive behavior.

**What AI helped with:**
- Checklist: semantic tags, heading hierarchy (`h1` → `h2` → `h3`), labels for `search-input`/`category-filter`/`sort-select`, `role="list"`/`listitem`, `aria-live`, `aria-modal`, focus-visible, delegation on `#product-grid`, grid `repeat(auto-fit, minmax(260px,1fr))`, `localStorage` constant + try/catch, `fetch` error handling.

**What was verified / decided independently:**
- Manually tested modal closes via button, backdrop, Escape; confirmed delegation (single listener) vs per-card listeners.
- Playwright-verified responsive columns at 375 (1 col), 768 (2 cols), 1366 (4 cols), 1920 (6-ish) — kept media queries minimal (single 640px header tweak).
- Rejected suggestion to add Tailwind/Bootstrap per assignment constraint; kept custom CSS properties.

## Reflection

**What did AI help me with?**
- Rapid API inspection and model mapping, Vite/TS boilerplate generation, systematic QA checklist, and Playwright automation for feature verification (search, filter, combined, empty state, modal, sort, localStorage, responsiveness).

**What did I have to understand and verify myself?**
- DummyJSON field semantics (thumbnail vs images), strict TypeScript constraints, accessible modal behavior (focus restore, `aria-hidden`), grid responsiveness, and that `No products found` / error messages match exact spec strings.

**Which AI suggestion did I modify or reject, and why?**
- *Rejected* disabling `noUnusedLocals` or using `any` for API parsing — kept strict typing.
- *Modified* bonus choice: AI offered pagination/favorites/skeleton; chose sorting (price + alphabetical) because it delivers value with minimal complexity and remains student-explainable.
- *Rejected* adding extra dependencies/UI libraries; kept vanilla stack per assignment.
