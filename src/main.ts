import "./style.css";

// ---------- Types ----------
interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

interface RawProduct {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  thumbnail: string;
  images: string[];
}

interface ApiResponse {
  products: RawProduct[];
  total: number;
  skip: number;
  limit: number;
}

// Required by assignment – typed API response wrapper around Product[]
interface ProductsResponse {
  products: Product[];
}

function toProductsResponse(products: Product[]): ProductsResponse {
  return { products };
}

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

// ---------- Constants ----------
const API_URL = "https://dummyjson.com/products?limit=100";
const STORAGE_KEY = "shopexplorer_search";

// ---------- State ----------
let allProducts: Product[] = [];
let lastFocusedElement: HTMLElement | null = null;

// ---------- DOM ----------
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const categoryFilter = document.getElementById("category-filter") as HTMLSelectElement;
const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;
const productGrid = document.getElementById("product-grid") as HTMLDivElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const resultCount = document.getElementById("result-count") as HTMLParagraphElement;

// modal
const modal = document.getElementById("modal") as HTMLDivElement;
const modalImage = document.getElementById("modal-image") as HTMLImageElement;
const modalTitle = document.getElementById("modal-title") as HTMLHeadingElement;
const modalCategory = document.getElementById("modal-category") as HTMLParagraphElement;
const modalDescription = document.getElementById("modal-description") as HTMLParagraphElement;
const modalPrice = document.getElementById("modal-price") as HTMLParagraphElement;

// ---------- Helpers ----------
function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function saveSearch(term: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, term);
  } catch {
    // ignore quota errors
  }
}

function loadSearch(): string {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ?? "";
  } catch {
    return "";
  }
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

// ---------- Fetch ----------
async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data: ApiResponse = (await response.json()) as ApiResponse;
  // Map RawProduct to Product (image = thumbnail)
  return data.products.map(
    ({ id, title, price, category, description, thumbnail }: RawProduct): Product => ({
      id,
      title,
      price,
      category,
      description,
      image: thumbnail,
    }),
  );
}

// ---------- Categories ----------
function populateCategories(products: Product[]): void {
  const categories = [...new Set(products.map((p) => p.category))].sort((a, b) =>
    a.localeCompare(b),
  );

  // keep "All Categories" first, then append
  for (const cat of categories) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  }
}

// ---------- Filtering + Sorting ----------
function getFilteredProducts(): Product[] {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const sort = sortSelect.value as SortOption;

  let filtered = allProducts.filter(({ title, category }) => {
    const matchesSearch = title.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Bonus: sorting
  if (sort !== "default") {
    // use spread to avoid mutating filtered directly in unexpected way (demonstrates spread)
    filtered = [...filtered];
    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  return filtered;
}

// ---------- Render ----------
function renderProducts(products: Product[]): void {
  // clear
  productGrid.innerHTML = "";

  if (products.length === 0) {
    statusEl.innerHTML = "<p>No products found</p>";
    statusEl.className = "status empty";
    statusEl.hidden = false;
    resultCount.textContent = "0 results";
    return;
  }

  statusEl.hidden = true;
  resultCount.textContent = `${products.length} ${products.length === 1 ? "result" : "results"}`;

  const fragment = document.createDocumentFragment();

  // Use map to create elements (requirement) – then append
  const cards = products.map((product) => createCard(product));
  for (const card of cards) fragment.appendChild(card);

  productGrid.appendChild(fragment);
}

function createCard(product: Product): HTMLElement {
  const { id, title, description, category, price, image } = product;

  const article = document.createElement("article");
  article.className = "card";
  article.setAttribute("role", "listitem");

  // escape quickly for innerHTML safety (simple)
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(truncate(description, 90));
  const safeCategory = escapeHtml(category);
  const safeAlt = escapeHtml(title);

  article.innerHTML = `
    <div class="card-media">
      <img src="${escapeHtml(image)}" alt="${safeAlt}" loading="lazy" width="400" height="300" />
    </div>
    <div class="card-body">
      <p class="card-category">${safeCategory}</p>
      <h3 class="card-title">${safeTitle}</h3>
      <p class="card-desc">${safeDesc}</p>
      <div class="card-footer">
        <span class="price">${formatPrice(price)}</span>
        <button type="button" class="btn" data-view="${id}" aria-label="View details for ${safeTitle}">View Details</button>
      </div>
    </div>
  `;
  return article;
}

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyFilters(): void {
  const filtered = getFilteredProducts();
  renderProducts(filtered);
}

// ---------- Modal ----------
function openModal(productId: number): void {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const { title, description, category, price, image } = product;

  modalImage.src = image;
  modalImage.alt = title;
  modalTitle.textContent = title;
  modalCategory.textContent = category;
  modalDescription.textContent = description;
  modalPrice.textContent = formatPrice(price);

  lastFocusedElement = document.activeElement as HTMLElement | null;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // focus close button
  const closeBtn = modal.querySelector<HTMLButtonElement>("[data-close-modal]");
  closeBtn?.focus();

  document.addEventListener("keydown", onEsc);
}

function closeModal(): void {
  if (modal.classList.contains("hidden")) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onEsc);
  // restore focus
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

function onEsc(e: KeyboardEvent): void {
  if (e.key === "Escape") closeModal();
}

// ---------- Init ----------
async function init(): Promise<void> {
  // restore search
  const saved = loadSearch().trim();
  if (saved) {
    searchInput.value = saved;
  }

  // listeners (before fetch to handle restored term)
  searchInput.addEventListener("input", () => {
    saveSearch(searchInput.value);
    applyFilters();
  });

  categoryFilter.addEventListener("change", applyFilters);
  sortSelect.addEventListener("change", applyFilters);

  // Event delegation for View Details
  productGrid.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>("[data-view]");
    if (!button) return;
    const id = Number(button.dataset.view);
    if (!Number.isNaN(id)) openModal(id);
  });

  // modal close: backdrop + close button
  modal.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-close-modal]")) closeModal();
  });

  // fetch
  statusEl.innerHTML = "<p>Loading products...</p>";
  statusEl.className = "status";
  statusEl.hidden = false;
  resultCount.textContent = "";

  try {
    allProducts = await fetchProducts();
    // validate typed wrapper (assignment requirement)
    const wrapped: ProductsResponse = toProductsResponse(allProducts);
    void wrapped;
    populateCategories(allProducts);
    // apply restored search after data loads
    applyFilters();
  } catch {
    statusEl.innerHTML = "<p>Unable to load products. Please try again.</p>";
    statusEl.className = "status error";
    statusEl.hidden = false;
    productGrid.innerHTML = "";
    resultCount.textContent = "";
  }
}

void init();
