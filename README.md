# ShopExplorer — Dynamic Product Explorer

A lightweight, accessible product catalog built with **Vite + Vanilla TypeScript**, fetching live data from DummyJSON. Search, filter, sort, and view product details in an accessible modal — all without frameworks.

## Features

- **Live API data** from `https://dummyjson.com/products?limit=100` with loading / error states
- **Dynamic product grid** generated with TypeScript (`map()`, `filter()`, destructuring, spread)
- **Search** by title — case-insensitive, instant, no reload; shows `No products found` when empty
- **Category filter** — categories derived dynamically from fetched data, includes `All Categories`, works together with search without extra requests
- **Product details modal** via **event delegation** on the grid; closes on close-button, backdrop click, and `Escape`; focus trapped/restored
- **localStorage persistence** — latest search term saved under `shopexplorer_search` and restored on reload
- **Responsive layout** — `repeat(auto-fit, minmax(260px, 1fr))` grid; header with flex; container queries via CSS; verified at 375, 768, 1366, 1920
- **Accessibility** — semantic HTML5 (`header`, `nav`, `main`, `section`, `article`, `footer`), heading hierarchy, labeled inputs, real buttons, visible focus states, `aria-live`, `aria-modal`
- **Bonus feature: Sorting** — sort by Price Low→High, High→Low, and Name A→Z (single extra `select`, no added complexity)

## Technologies

- Vite 8
- Vanilla TypeScript (strict)
- Semantic HTML5
- Modern CSS3 (custom properties, `rem`/`em`, Flexbox, Grid, `minmax()`, `auto-fit`, transitions, hover/focus states)

## API

- **Endpoint:** `https://dummyjson.com/products?limit=100`
- **Method:** `fetch` + `async/await` + `response.ok` validation + `try/catch`
- **Mapping:** `thumbnail` → `image` in local `Product` interface

```ts
interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
}
interface ProductsResponse { products: Product[]; }
```

States:
- While loading: `Loading products...`
- On failure: `Unable to load products. Please try again.` (no fake data)
- Empty filter: `No products found`

## Getting Started

### Prerequisites
- Node.js 18+

### Install
```bash
npm install
```

### Run (dev)
```bash
npm run dev
# → http://localhost:5173
```

### Build
```bash
npm run build
npm run preview  # preview production build
```

## Project Structure

```
dynamic-product-explorer/
├── index.html          # semantic shell, header/nav/search, controls, grid, modal
├── src/
│   ├── main.ts         # strict TS: fetch, filter, sort, render, delegation, modal, storage
│   └── style.css       # tokens, responsive grid, header, cards, modal
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── screenshots/
│   ├── desktop.png     # 1366×900
│   └── mobile.png      # 375×812
├── package.json
├── tsconfig.json
└── README.md
```

## Screenshots

| Desktop (1366) | Mobile (375) |
|---|---|
| ![Desktop](./screenshots/desktop.png) | ![Mobile](./screenshots/mobile.png) |

## Bonus Feature Detail

**Sorting** was chosen over favorites/pagination/skeleton because it adds clear user value with minimal code and keeps the project explainable. Implemented as a `<select id="sort-select">` with values `default | price-asc | price-desc | name-asc`, applied after `filter()` via a shallow copy (`[...filtered]`) and `sort()`.

## Accessibility & Quality Notes

- Event delegation: single listener on `#product-grid` for all `data-view` buttons.
- `localStorage` key constant `STORAGE_KEY` with safe `try/catch`.
- CSS uses `rem`/`em`, custom properties, `focus-visible`, no external UI libraries.
- No `any`; all functions/DOM/state are typed.

## License

MIT — for assignment purposes.
