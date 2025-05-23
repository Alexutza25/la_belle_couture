document.addEventListener("DOMContentLoaded", async () => {
    await loadFilters(); // încarcă filtrele
    await loadAllProductsGroupedByCategory(); // încarcă toate produsele

    // 🔍 Căutare
    document.getElementById("searchInput").addEventListener("input", runSearch);
    document.getElementById("searchBtn").addEventListener("click", runSearch);

    // 🎯 Afișează sidebar-ul de filtre
    const toggleBtn = document.getElementById('filterToggle');
    toggleBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('filterSidebar');
        sidebar.classList.remove('hidden');
        sidebar.classList.add('show');
        updateFilterToggleForSidebar();
    });

    // ❌ Închide sidebar și reîncarcă produsele
    document.getElementById('closeFilter').addEventListener('click', async () => {
        const sidebar = document.getElementById('filterSidebar');
        sidebar.classList.remove('show');
        sidebar.classList.add('hidden');
        await loadAllProductsGroupedByCategory();
        updateFilterToggleForSidebar(); // 🧼 refacem produsele
    });

    // ✅ Aplică filtre
    const applyBtn = document.getElementById('applyFilters');
    applyBtn.addEventListener('click', async () => {
        const selectedCategories = Array.from(document.querySelectorAll('.filter-category:checked')).map(cb => cb.value);
        const selectedColors = Array.from(document.querySelectorAll('.filter-color:checked')).map(cb => cb.value);
        const selectedMaterials = Array.from(document.querySelectorAll('.filter-material:checked')).map(cb => cb.value);
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;

        const filters = {
            categories: selectedCategories,
            colors: selectedColors,
            materials: selectedMaterials,
            minPrice: minPrice ? parseFloat(minPrice) : null,
            maxPrice: maxPrice ? parseFloat(maxPrice) : null
        };

        const response = await fetch('/api/product/filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filters)
        });

        const products = await response.json();
        renderProducts(products);
    });
});

function updateFilterToggleForSidebar() {
    const sidebar = document.getElementById('filterSidebar');
    const toggle = document.getElementById('filterToggle');

    if (sidebar.classList.contains('show')) {
        toggle.style.right = '320px';
        document.body.classList.add('with-filter-sidebar'); // 💥 adăugăm spațiu
    } else {
        toggle.style.right = '20px';
        document.body.classList.remove('with-filter-sidebar'); // 💥 îl scoatem
    }
}
function renderProducts(products) {
    const container = document.getElementById("productContainer");
    container.innerHTML = ""; // ștergem tot

    if (products.length === 0) {
        container.innerHTML = "<p>No products found 😢</p>";
        return;
    }

    const section = document.createElement("section");
    section.classList.add("category-section");

    const productGrid = document.createElement("div");
    productGrid.classList.add("product-grid");

    products.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.setAttribute("data-id", p.productId);

        card.innerHTML = `
            <img src="${p.imageURL}" alt="${p.name}" />
            <p class="title">${p.name}</p>
            <p class="desc">${p.description}</p>
            <p class="price">💸 ${p.price} $</p>
        `;

        card.addEventListener("click", () => {
            window.location.href = `/Product?id=${p.productId}`;
        });

        productGrid.appendChild(card);
    });

    section.appendChild(productGrid);
    container.appendChild(section);
}

async function runSearch() {
    const name = document.getElementById("searchInput").value;

    if (!name.trim()) {
        await loadAllProductsGroupedByCategory();
        return;
    }

    try {
        const res = await fetch(`/api/Product/search-by-name?name=${encodeURIComponent(name)}`);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server error: ${errorText}`);
        }

        const products = await res.json();
        renderProducts(products);

    } catch (err) {
        console.error("💥 Eroare la căutare:", err);
    }
}

async function loadFilters() {
    try {
        const [categories, colors, materials, priceRange] = await Promise.all([
            fetch('/api/product/categories').then(r => r.json()),
            fetch('/api/product/colors').then(r => r.json()),
            fetch('/api/product/materials').then(r => r.json()),
            fetch('/api/product/price-range').then(r => r.json())
        ]);

        fillFilterOptions('#filterCategories', categories, 'filter-category');
        fillFilterOptions('#filterColors', colors, 'filter-color');
        fillFilterOptions('#filterMaterials', materials, 'filter-material');

        const priceMinInput = document.getElementById('minPrice');
        const priceMaxInput = document.getElementById('maxPrice');

        priceMinInput.min = priceRange.min;
        priceMinInput.max = priceRange.max;
        priceMinInput.value = priceRange.min;

        priceMaxInput.min = priceRange.min;
        priceMaxInput.max = priceRange.max;
        priceMaxInput.value = priceRange.max;

    } catch (err) {
        console.error('Eroare la încărcarea filtrelor:', err);
    }
}

function fillFilterOptions(containerSelector, values, className) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = '';
    values.forEach(value => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${value}" class="${className}"> ${value}`;
        container.appendChild(label);
    });
}

async function loadAllProductsGroupedByCategory() {
    const container = document.getElementById("productContainer");
    container.innerHTML = "";

    try {
        const res = await fetch("/api/Category");
        if (!res.ok) throw new Error("Eroare la încărcarea categoriilor");

        const categories = await res.json();

        for (const category of categories) {
            const section = document.createElement("section");
            section.classList.add("category-section");

            const title = document.createElement("h2");
            title.textContent = category.name;
            section.appendChild(title);

            const productGrid = document.createElement("div");
            productGrid.classList.add("product-grid");

            const prodRes = await fetch(`/api/Product/category/${category.categoryId}`);
            if (!prodRes.ok) continue;

            const products = await prodRes.json();

            if (products.length === 0) {
                const msg = document.createElement("p");
                msg.textContent = "There are no products in this category yet";
                section.appendChild(msg);
            } else {
                products.forEach(p => {
                    const card = document.createElement("div");
                    card.classList.add("product-card");
                    card.setAttribute("data-id", p.productId);

                    card.innerHTML = `
                        <img src="${p.imageURL}" alt="${p.name}" />
                        <p class="title">${p.name}</p>
                        <p class="desc">${p.description}</p>
                        <p class="price">💸 ${p.price} $</p>
                    `;

                    card.addEventListener("click", () => {
                        window.location.href = `/Product?id=${p.productId}`;
                    });

                    productGrid.appendChild(card);
                });

                section.appendChild(productGrid);
            }

            container.appendChild(section);
        }
    } catch (err) {
        console.error("⚠️", err);
        container.innerHTML = "<p>We couldn't load the products 😓</p>";
    }
}
