function isAdminUser() {
    
    const token = localStorage.getItem("jwt");
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        return payload.exp > now && role === "Administrator";
    } catch {
        return false;
    }
}

function toast(text, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = text;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

async function populateCategoryDropdown(selectEl) {
    const res = await fetch("/api/Category");
    const categories = await res.json();
    if (!selectEl) {
        console.warn("Dropdownul de categorii nu a fost găsit!");
        return;
    }


    selectEl.innerHTML = "<option value=''>Select category</option>";
    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.categoryId;
        opt.textContent = cat.name;
        selectEl.appendChild(opt);
    });
}


function setupCategoryModal(token) {
    const modal = document.getElementById("categoryModal");
    const openModal = document.getElementById("openCategoryModal");
    const closeModal = document.getElementById("closeCategoryModal");
    const list = document.getElementById("categoryList");
    const message = document.getElementById("categoryMessage");

    const addCategoryForm = document.getElementById("addCategoryForm");
    const scrollToAddCategoryBtn = document.getElementById("scrollToAddCategory");
    addCategoryForm.classList.add("hidden");

    scrollToAddCategoryBtn?.addEventListener("click", () => {
        addCategoryForm.classList.remove("hidden");
        addCategoryForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const saveCategoryBtn = document.getElementById("saveCategoryBtn");

    openModal.addEventListener("click", async e => {
        e.preventDefault();
        modal.classList.add("active");


            await loadCategories();
       
    });

    closeModal.addEventListener("click", () => {
        modal.classList.remove("active");
        message.textContent = "";
    });

    async function loadCategories() {
        list.innerHTML = "";
        const res = await fetch("/api/category");
        const data = await res.json();

        data.forEach(cat => {
            const li = document.createElement("li");
            li.dataset.id = cat.categoryId;
            li.innerHTML = `
                <span>${cat.name}</span>
                <div>
                    <button class="btn edit-btn">✏️</button>
                    <button class="btn delete-btn">🗑️</button>
                </div>
            `;
            list.appendChild(li);
        });

        list.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const li = e.target.closest("li");
                const id = li.dataset.id;
                const oldName = li.querySelector("span").textContent;
                editCategory(id, li, oldName);
            });
        });

        list.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const li = e.target.closest("li");
                const id = li.dataset.id;
                await deleteCategory(id);
            });
        });
    }

    saveCategoryBtn.addEventListener("click", async () => {
        const name = document.getElementById("newCategoryName").value.trim();
        if (!name) return toast("Please enter a name!", "error");

        const res = await fetch("/api/category/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (res.ok) {
            toast("✔️ Category added!");
            await loadCategories();
            document.getElementById("newCategoryName").value = "";
            addCategoryForm.classList.add("hidden");
        } else {
            toast("❌ Failed to add category", "error");
        }
    });

    function editCategory(id, li, oldName) {
        const span = li.querySelector("span");
        const buttonsDiv = li.querySelector("div");

        const input = document.createElement("input");
        input.type = "text";
        input.value = oldName;
        input.className = "input-edit";
        span.replaceWith(input);

        buttonsDiv.innerHTML = "";

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "💾";
        saveBtn.className = "btn";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "❌";
        cancelBtn.className = "btn";

        buttonsDiv.appendChild(saveBtn);
        buttonsDiv.appendChild(cancelBtn);

        saveBtn.addEventListener("click", async () => {
            const newName = input.value.trim();
            if (!newName || newName === oldName) return toast("No changes made", "error");

            const res = await fetch(`/api/category/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (res.ok) {
                toast("✔️ Category updated");
                await loadCategories();
            } else {
                toast("❌ Update failed", "error");
            }
        });

        cancelBtn.addEventListener("click", () => {
            input.replaceWith(span);
            loadCategories();
        });
    }

    async function deleteCategory(id) {
        const res = await fetch(`/api/category/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            toast("🗑️ Category deleted");
            await loadCategories();
        } else {
            toast("❌ Can't delete category", "error");
        }
    }
}


function setupProductModal(token) {
    const openModalBtn = document.getElementById("openProductModal");
    const closeModalBtn = document.getElementById("closeProductModal");
    const productModal = document.getElementById("productModal");

    const productList = document.getElementById("productCategoryList");
    const productMsg = document.getElementById("productMessage");

    const nameInput = document.getElementById("productName");
    const descInput = document.getElementById("productDescription");
    const imageInput = document.getElementById("productImageUrl");
    const priceInput = document.getElementById("productPrice");
    const colourInput = document.getElementById("productColour");
    const materialInput = document.getElementById("productMaterial");
    const saveBtn = document.getElementById("submitProduct");
    const categorySelect = document.getElementById("productCategorySelect");
    const scrollToAddProductBtn = document.getElementById("scrollToAddProduct");

    scrollToAddProductBtn?.addEventListener("click", () => {
        document.getElementById("addProductForm")?.scrollIntoView({ behavior: "smooth" });
    });

    if (openModalBtn) {
        openModalBtn.addEventListener("click", async () => {
            productModal.style.display = "flex";
            setTimeout(() => productModal.classList.add("active"), 10);
            const categorySelect = document.getElementById("productCategorySelect");
            //await populateCategoryDropdown(categorySelect);
            loadCategoryList();
            
            
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            productModal.classList.remove("active");
            setTimeout(() => {
                productModal.style.display = "none";
                productList.innerHTML = "";
                productMsg.textContent = "";
            }, 300);
        });
    }
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const row = btn.closest("tr");
            // ID-ul produsului în primul <td>
            window.currentEditingProductId = row.querySelector("td").textContent.trim();

            const cells = row.querySelectorAll("td");
            nameInput.value      = cells[1].textContent.trim();
            descInput.value      = cells[2].textContent.trim();
            priceInput.value     = parseFloat(cells[3].textContent);
            materialInput.value  = cells[4].textContent.trim();
            colourInput.value    = cells[5].textContent.trim();
            imageInput.value     = row.querySelector("img").src;
            // dacă ai pus data-category-id pe <tr>, preia-l:
            categorySelect.value = row.dataset.categoryId || "";
        });
    });

    saveBtn.addEventListener("click", async () => {
        const selectedCategoryId = categorySelect.value;
        const name = nameInput.value;
        const description = descInput.value;
        const imageURL = imageInput.value;
        const price = parseFloat(priceInput.value);
        const colour = colourInput.value;
        const material = materialInput.value;

        productMsg.textContent = "";

        if (!name || !description || !imageURL || isNaN(price) || !colour || !material || !selectedCategoryId) {
            productMsg.textContent = "❌ Please complete all fields!";
            return;
        }

        const newProduct = {
            name,
            description,
            imageURL,
            price,
            colour,
            material,
            categoryId: parseInt(selectedCategoryId),
        };


        const isEdit = Boolean(window.currentEditingProductId);
        const editingId = window.currentEditingProductId;
        const method = isEdit ? "PUT" : "POST";
        const url = isEdit
            ? `/api/Product/${editingId}`
            : "/api/Product";

        console.log("🔗 URL:", url);
        console.log("📤 Trimitem:", newProduct);

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newProduct)
            });

            if (res.ok) {
                const resultProduct = await res.json();
                toast(isEdit ? "✅ Product updated!" : "✅ Product added!");

                // curățare form
                nameInput.value = "";
                descInput.value = "";
                imageInput.value = "";
                priceInput.value = "";
                colourInput.value = "";
                materialInput.value = "";
                categorySelect.value = "";
                window.currentEditingProductId = null;

                productModal.classList.remove("active");
                setTimeout(() => productModal.style.display = "none", 300);

                // reîncărcare
                await renderDynamicDashboard();
            } else {
                const errMsg = await res.text();
                console.error("❌ Eroare server:", errMsg);
                toast("❌ Eroare server: " + errMsg, "error");
            }

        } catch (err) {
            console.error("❌ Network/server crash:", err);
            toast("❌ Eroare la trimitere", "error");
        }
    });










    async function loadCategoryList() {
        productList.innerHTML = "";
        categorySelect.innerHTML = "<option value=''>Select category</option>";

        const res = await fetch("/api/Category");
        const categories = await res.json();

        for (const cat of categories) {
            const li = document.createElement("li");
            li.dataset.id = cat.categoryId;
            li.innerHTML = `
                <span>${cat.name}</span>
                <div>
                    <button class="btn toggle-btn">▼</button>
                </div>
            `;

            productList.appendChild(li);

            const opt = document.createElement("option");
            opt.value = cat.categoryId;
            opt.textContent = cat.name;
            categorySelect.appendChild(opt);

            li.querySelector(".toggle-btn").addEventListener("click", async () => {
                const existing = li.querySelector("ul");
                if (existing) {
                    existing.remove();
                    return;
                }

                const ul = document.createElement("ul");
                ul.style.marginTop = "10px";

                const prodRes = await fetch(`/api/Product/category/${cat.categoryId}`);
                const products = await prodRes.json();

                products.forEach(prod => {
                    const item = document.createElement("li");
                    item.style.margin = "5px 0";

                    const content = document.createElement("div");
                    content.innerHTML = `
                        <span><strong>${prod.name}</strong></span>
                        <button class="btn toggle-product-details">▼</button>
                        <div class="product-details" style="display: none; margin-top: 5px;">
                            <p>${prod.description}</p>
                            <p>💸 ${prod.price} $</p>
                            <p>🎨 ${prod.colour}</p>
                            <p>🧵 ${prod.material}</p>
                            <div>
                                <button class="btn-edit">✏️</button>
                                <button class="btn-delete">🗑️</button>
                            </div>
                        </div>
                    `;

                    const toggleBtn = content.querySelector(".toggle-product-details");
                    const detailsDiv = content.querySelector(".product-details");

                    toggleBtn.addEventListener("click", () => {
                        if (detailsDiv.style.display === "none") {
                            detailsDiv.style.display = "block";
                            toggleBtn.textContent = "▲";
                        } else {
                            detailsDiv.style.display = "none";
                            toggleBtn.textContent = "▼";
                        }
                    });

                    content.querySelector(".btn-delete").addEventListener("click", async () => {
                        await fetch(`/api/Product/${prod.productId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        await loadCategoryList();
                    });

                    content.querySelector(".btn-edit").addEventListener("click", () => {
                        nameInput.value = prod.name || "";
                        descInput.value = prod.description || "";
                        imageInput.value = prod.imageURL || "";
                        priceInput.value = prod.price || "";
                        colourInput.value = prod.colour || "";
                        materialInput.value = prod.material || "";
                        categorySelect.value = prod.categoryId?.toString() || "";
                        window.currentEditingProductId = prod.productId;
                        document.getElementById("addProductForm").scrollIntoView({ behavior: "smooth" });
                    });

                    item.appendChild(content);
                    ul.appendChild(item);
                });

                li.appendChild(ul);
            });
        }
    }

    const scrollBtn = document.getElementById("scrollToAddProduct");
    const form = document.getElementById("addProductForm");

    if (scrollBtn && form) {
        scrollBtn.addEventListener("click", () => {
            form.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }
}

let variantModalInitialized = false;


function setupVariantModal(token) {
    if (variantModalInitialized) return;
    else variantModalInitialized = true;
    const openVariantModalBtn = document.getElementById("openVariantModal");
    const variantModal = document.getElementById("variantModal");
    const closeVariantModal = document.getElementById("closeVariantModal");

    const variantEditModal = document.getElementById("variantEditModal");
    const closeVariantEditModal = document.getElementById("closeVariantEditModal");

    const variantCategoriesContainer = document.getElementById("variantCategoriesContainer");
    const variantEditContainer = document.getElementById("variantEditContainer");

    if (!openVariantModalBtn || !variantModal) return;

    openVariantModalBtn.addEventListener("click", async () => {
        variantModal.style.display = "flex";
        setTimeout(() => variantModal.classList.add("active"), 10);

        variantCategoriesContainer.innerHTML = "";
        const res = await fetch("/api/Category");
        const categories = await res.json();

        for (const cat of categories) {
            const catDiv = document.createElement("div");
            catDiv.innerHTML = `<strong>${cat.name}</strong>`;
            const toggleBtn = document.createElement("button");
            toggleBtn.textContent = "▼";
            toggleBtn.classList.add("btn");

            const prodList = document.createElement("ul");
            prodList.style.marginTop = "10px";
            prodList.style.display = "none";

            toggleBtn.addEventListener("click", async () => {
                if (prodList.style.display === "block") {
                    prodList.style.display = "none";
                    return;
                }
                prodList.innerHTML = "";
                const resProd = await fetch(`/api/Product/category/${cat.categoryId}`);
                const products = await resProd.json();

                products.forEach(prod => {
                    const li = document.createElement("li");
                    li.textContent = prod.name;
                    li.style.cursor = "pointer";

                    li.addEventListener("click", () => {
                        openVariantEditor(prod.productId, prod.name, token);
                    });

                    prodList.appendChild(li);
                });

                prodList.style.display = "block";
            });

            catDiv.appendChild(toggleBtn);
            catDiv.appendChild(prodList);
            variantCategoriesContainer.appendChild(catDiv);
        }
    });

    closeVariantModal?.addEventListener("click", () => {
        variantModal.classList.remove("active");
        setTimeout(() => {
            variantModal.style.display = "none";
        }, 300);
    });

    closeVariantEditModal?.addEventListener("click", () => {
        variantEditModal.classList.remove("active");
        setTimeout(() => {
            variantEditModal.style.display = "none";
        }, 300);
    });

    let currentVariantProductId = null;

    function openVariantEditor(productId, productName, token) {
        currentVariantProductId = productId;
        variantEditModal.style.display = "flex";
        setTimeout(() => variantEditModal.classList.add("active"), 10);

        variantEditContainer.innerHTML = `
    <h3>${productName}</h3>
    <button class="btn green" id="scrollToAddVariant">➕ Add Variant</button>

    <div id="variantForm" class="hidden" style="margin-top: 1rem;">
        <input type="number" id="variantStock" placeholder="Stock" />
        <input type="text" id="variantSize" placeholder="Size" />
        <button class="btn green" id="addNewVariant">Save Variant</button>
    </div>

    <p id="variantMessage" style="color: green; margin-top: 10px;"></p>
    <div id="existingVariantsContainer" style="margin-top: 1rem;"></div>
`;
        document.getElementById("scrollToAddVariant")?.addEventListener("click", () => {
            const form = document.getElementById("variantForm");
            form.classList.remove("hidden");
            form.scrollIntoView({ behavior: "smooth", block: "start" });
        });


        loadProductVariants(productId);
        setupAddVariantHandler();
    }

    function setupAddVariantHandler() {
        const btn = document.getElementById("addNewVariant");
        btn.addEventListener("click", async () => {
            const stock = parseInt(document.getElementById("variantStock").value);
            const size = document.getElementById("variantSize").value;
            const msg = document.getElementById("variantMessage");

            if (isNaN(stock)|| !size || currentVariantProductId === null) {
                msg.textContent = "Please complete all fields!";
                return;
            }

            const newVariant = {
                stock,
                size,
                productId: currentVariantProductId
            };

            const res = await fetch("/api/ProductVariant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newVariant)
            });

            if (res.ok) {
                toast("✅ Variant added!");
                document.getElementById("variantStock").value = "";
                document.getElementById("variantSize").value = "";
                loadProductVariants(currentVariantProductId);
            } else {
                toast("❌ Failed to add variant!");
            }
        });
    }

    async function loadProductVariants(productId) {
        const container = document.getElementById("existingVariantsContainer");
        container.innerHTML = "<h4>Existing Variants:</h4>";

        const res = await fetch("/api/ProductVariant", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const allVariants = await res.json();
        const filtered = allVariants.filter(v => v.productId === productId);

        if (filtered.length === 0) {
            container.innerHTML += "<p>No variants found.</p>";
            return;
        }

        filtered.forEach(variant => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("variant-item");
            wrapper.innerHTML = `
            <input type="number" value="${variant.stock}" class="variant-stock-input" />
            <input type="text" value="${variant.size}" class="variant-size-input" />
            <button class="btn-update" data-id="${variant.variantId}">💾</button>
            <button class="btn-delete" data-id="${variant.variantId}">🗑️</button>
            `;
            container.appendChild(wrapper);

            wrapper.querySelector(".btn-update").addEventListener("click", async () => {
                const id = wrapper.querySelector(".btn-update").dataset.id;
                const updated = {
                    variantId: parseInt(id),
                    stock: parseInt(wrapper.querySelector(".variant-stock-input").value),
                    size: wrapper.querySelector(".variant-size-input").value,
                    productId: currentVariantProductId
                };

                const res = await fetch(`/api/ProductVariant/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(updated)
                });

                if (res.ok) {
                    toast("✅ Variant updated!");
                } else {
                    toast("❌ Update failed!");
                }
            });

            wrapper.querySelector(".btn-delete").addEventListener("click", async () => {
                const id = wrapper.querySelector(".btn-delete").dataset.id;
                const res = await fetch(`/api/ProductVariant/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    toast("🗑️ Variant deleted!");
                    loadProductVariants(productId);
                } else {
                    toast("❌ Delete failed!");
                }
            });
        });
    }

}

// Global pentru Edit Product
window.openProductModalAdd = async function () {
    const productModal = document.getElementById("productModal");
    const categorySelect = document.getElementById("productCategorySelect");

    productModal.style.display = "flex";
    setTimeout(() => productModal.classList.add("active"), 10);

    await populateCategoryDropdown(categorySelect);

    document.getElementById("productName").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productImageUrl").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productColour").value = "";
    document.getElementById("productMaterial").value = "";
    document.getElementById("productCategorySelect").value = "";

    window.currentEditingProductId = null;

    document.getElementById("addProductForm").scrollIntoView({ behavior: "smooth" });
};


window.openProductModalEdit = async function (product) {
    const productModal = document.getElementById("productModal");
    const categorySelect = document.getElementById("productCategorySelect");

    productModal.style.display = "flex";
    setTimeout(() => productModal.classList.add("active"), 10);

    await populateCategoryDropdown(categorySelect);

    document.getElementById("productName").value = product.name || "";
    document.getElementById("productDescription").value = product.description || "";
    document.getElementById("productImageUrl").value = product.imageURL || "";
    document.getElementById("productPrice").value = product.price || "";
    document.getElementById("productColour").value = product.colour || "";
    document.getElementById("productMaterial").value = product.material || "";
    document.getElementById("productCategorySelect").value = product.categoryId?.toString() || "";

    window.currentEditingProductId = product.productId;

    document.getElementById("addProductForm").scrollIntoView({ behavior: "smooth" });
};


// 🔧 Deschide modalul pentru adăugare variantă (cu form dinamic)
window.openProductModalEdit = async function (product) {
    const productModal = document.getElementById("productModal");
    const categorySelect = document.getElementById("productCategorySelect");

    productModal.style.display = "flex";
    setTimeout(() => productModal.classList.add("active"), 10);


    await populateCategoryDropdown(categorySelect); // folosește-l după ce l-ai definit
    
    document.getElementById("productName").value = product.name || "";
    document.getElementById("productDescription").value = product.description || "";
    document.getElementById("productImageUrl").value = product.imageURL || "";
    document.getElementById("productPrice").value = product.price || "";
    document.getElementById("productColour").value = product.colour || "";
    document.getElementById("productMaterial").value = product.material || "";
    document.getElementById("productCategorySelect").value = product.categoryId?.toString() || "";

    window.currentEditingProductId = product.productId;

    document.getElementById("addProductForm").scrollIntoView({ behavior: "smooth" });
};

async function loadVariantsInContainer(productId) {
    const container = document.getElementById(`variants-${productId}`);
    if (!container) return;

    container.innerHTML = `
        <table class="table table-sm">
            <thead class="variant-header">
                <tr>
                    <th>Variant ID</th>
                    <th>Size</th>
                    <th>Stock</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    const tbody = container.querySelector("tbody");

    const res = await fetch("/api/ProductVariant");
    const variants = await res.json();
    const filtered = variants.filter(v => v.productId === productId);

    filtered.forEach(variant => {
        const row = document.createElement("tr");
        console.log("💬 Variant in tabel:", variant.variantId);

        row.innerHTML = `
            <td>${variant.variantId}</td>
            <td>${variant.size}</td>
            <td>${variant.stock}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick='openVariantModalEdit(${JSON.stringify(variant)})'>Edit</button>
                <button class="btn btn-danger btn-sm" onclick='deleteItem("variant", ${variant.variantId}, this)'>Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}


window.openVariantModalAdd = function(productId) {
    const modal = document.getElementById("variantEditModal");
    const container = document.getElementById("variantEditContainer");

    if (!modal || !container) return console.error("🛑 Variant modal nu există.");

    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("active"), 10);

    container.innerHTML = `
        <h3>Add Variant</h3>
        <form id="variantForm">
            <input type="hidden" name="productId" value="${productId}" />
            <label>Size</label>
            <input type="text" name="size" required />
            <label>Stock</label>
            <input type="number" name="stock" required />
            <button type="submit" class="btn green">💾 Save</button>
        </form>
    `;

    const form = document.getElementById("variantForm");
    form.onsubmit = async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {};
        formData.forEach((v, k) => {
            data[k] = (k === "stock" || k === "productId") ? parseInt(v) : v;
        });

        const res = await fetch("/api/ProductVariant", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            toast("✅ Variant added!");
            document.getElementById("variantForm").reset(); // șterge valorile
            await loadVariantsInContainer(productId); // 🔥 reîncarcă variantele instant
        } else {
            toast("❌ Failed to add variant", "error");
        }
    };
};


// 🔧 Deschide modalul pentru editare variantă (cu form dinamic)
window.openVariantModalEdit = function(variant) {
    const modal = document.getElementById("variantEditModal");
    const container = document.getElementById("variantEditContainer");

    if (!modal || !container) return console.error("Modalul de variantă nu există.");

    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("active"), 10);

    container.innerHTML = `
        <h3>Edit Variant</h3>
        <form id="variantForm">
            <input type="hidden" name="variantId" value="${variant.variantId ?? ''}" />
            <input type="hidden" name="productId" value="${variant.productId || variant.ProductId || ''}" />
            <label>Size</label>
            <input type="text" name="size" value="${variant.size || variant.Size || ''}" required />
            <label>Stock</label>
            <input type="number" name="stock" value="${variant.stock || variant.Stock || ''}" required />
            <button type="submit" class="btn green">💾 Save</button>
        </form>
    `;

    const form = document.getElementById("variantForm");
    form.onsubmit = async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {};
        formData.forEach((v, k) => {
            data[k] = (k === "stock" || k === "productId" || k === "variantId") ? parseInt(v) : v;
        });
        console.log("Data trimisă:", data);

        const res = await fetch(`/api/ProductVariant/${data.variantId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(data)
        });
        const variants = await res.json();
        console.log("🔍 Variants din backend:", variants);


        if (res.ok) {
            toast("✅ Variant updated!");

            // 💡 Actualizare DOM direct:
            const table = document.querySelector(`#variants-${variant.productId} table`);
            const row = Array.from(table.querySelectorAll("tr")).find(tr =>
                tr.firstElementChild?.textContent.trim() === data.variantId.toString()
            );

            if (row) {
                const cells = row.querySelectorAll("td");
                cells[0].textContent = data.variantId;
                cells[1].textContent = data.size;
                cells[2].textContent = data.stock;
            }

            modal.classList.remove("active");
            setTimeout(() => {
                modal.style.display = "none";
            }, 300);
        } else {
            toast("❌ Failed to update variant", "error");
        }

    };
};

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// Funcții globale de ștergere pentru Products și Variants
// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// Ștergere fără reload: produs și variantă
// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––

/**
 * Afișează un dialog de confirmare centrat în pagină.
 * @param {string} message Textul de afișat.
 * @returns {Promise<boolean>} Rezolvă cu true dacă s-a apăsat Da, false la Nu.
 */
function showConfirmationDialog(message) {
    return new Promise(resolve => {
        // overlay semi-transparent
        const overlay = document.createElement("div");
        overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
    `;

        // dialog box cu degradeu roz → crem pal
        const box = document.createElement("div");
        box.style.cssText = `
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #ffcad4 0%, #fff5e4 100%);
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      text-align: center;
      min-width: 280px;
    `;

        const text = document.createElement("p");
        text.textContent = message;
        text.style.marginBottom = "1rem";
        text.style.color = "#333";

        const btnYes = document.createElement("button");
        btnYes.textContent = "Yes";
        btnYes.style.cssText = `
      margin: 0 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      background: #ff9aa2;
      color: #fff;
      font-weight: bold;
    `;

        const btnNo = document.createElement("button");
        btnNo.textContent = "No";
        btnNo.style.cssText = `
       margin: 0 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      background: #ff9aa2;
      color: #fff;
      font-weight: bold;
    `;

        box.append(text, btnYes, btnNo);
        document.body.append(overlay, box);

        btnYes.addEventListener("click", () => {
            cleanup();
            resolve(true);
        });
        btnNo.addEventListener("click", () => {
            cleanup();
            resolve(false);
        });
        function cleanup() {
            overlay.remove();
            box.remove();
        }
    });
}


async function deleteProduct(id, btn) {
    const confirmed = await showConfirmationDialog("Are you sure you want to delete this product?");
    if (!confirmed) return;
    const token = localStorage.getItem("jwt");
    try {
        const res = await fetch(`/api/Product/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Status " + res.status);

        // 1) Elimină din DOM rândul de produs
        const row = btn.closest("tr");
        // 2) Dacă există rândul imediat următor (cel cu variante), îl elimini
        const next = row.nextElementSibling;
        if (next && next.querySelector(".variant-container")) {
            next.remove();
        }
        row.remove();

        toast("🗑️ Product deleted!");
    } catch (err) {
        console.error(err);
        toast("❌ Delete failed!", "error");
    }
}

async function deleteVariant(id, btn) {
    const confirmed = await showConfirmationDialog("Are you sure you want to delete this variant?");
    if (!confirmed) return;    
    const token = localStorage.getItem("jwt");
    try {
        const res = await fetch(`/api/ProductVariant/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Status " + res.status);

        // Elimină doar rândul variantei din tabelul de variante
        const row = btn.closest("tr");
        row.remove();

        toast("🗑️ Variant deleted!");
    } catch (err) {
        console.error(err);
        toast("❌ Delete failed!", "error");
    }
}

// Wrapperul apelat din HTML
window.deleteItem = function(type, id, btn) {
    if (type === "product") {
        deleteProduct(id, btn);
    } else if (type === "variant") {
        deleteVariant(id, btn);
    } else {
        console.warn("Unknown delete type:", type);
    }
};

// 🔧 Adaugă această funcție în modals.js pentru a popula dinamic interfața cu categorii și produse
async function renderDynamicDashboard() {
    const container = document.getElementById("productTableContainer");
    if (!container) return;

    console.log("Rendering dashboard");
    container.innerHTML = ""; // Golește înainte de reîncărcare

    const resCategories = await fetch("/api/Category");
    const categories = await resCategories.json();

    for (const category of categories) {
        const catHeader = document.createElement("h3");
        catHeader.textContent = category.name;
        container.appendChild(catHeader);

        const table = document.createElement("table");
        table.className = "table";
        table.innerHTML = `
            <thead class="product-header">
                <tr>
                    <th>Product Code (ID)</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Material</th>
                    <th>Colour</th>
                    <th>Image</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");
        const resProducts = await fetch(`/api/Product/category/${category.categoryId}`);
        const products = await resProducts.json();

        for (const product of products) {
            const row = document.createElement("tr");

            const tdId = document.createElement("td");
            tdId.textContent = product.productId;

            const tdName = document.createElement("td");
            tdName.textContent = product.name;

            const tdDesc = document.createElement("td");
            tdDesc.textContent = product.description;
            tdDesc.className = "desc-cell";

            const tdPrice = document.createElement("td");
            tdPrice.textContent = product.price;

            const tdMat = document.createElement("td");
            tdMat.textContent = product.material;

            const tdCol = document.createElement("td");
            tdCol.textContent = product.colour;

            const tdImg = document.createElement("td");
            const img = document.createElement("img");
            img.src = product.imageURL;
            img.alt = "Product Image";
            img.width = 50;
            tdImg.appendChild(img);

            const tdActions = document.createElement("td");
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "btn btn-danger btn-sm";
            editBtn.addEventListener("click", () => openProductModalEdit(product));

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "btn btn-danger btn-sm";
            deleteBtn.addEventListener("click", () => deleteItem("product", product.productId, deleteBtn));

            tdActions.appendChild(editBtn);
            tdActions.appendChild(deleteBtn);

// 🧩 Adaugă toate celulele în rând
            row.appendChild(tdId);
            row.appendChild(tdName);
            row.appendChild(tdDesc);
            row.appendChild(tdPrice);
            row.appendChild(tdMat);
            row.appendChild(tdCol);
            row.appendChild(tdImg);
            row.appendChild(tdActions);

// 🧼 și abia apoi îl adaugi în tabel

            tbody.appendChild(row);

            const variantsRow = document.createElement("tr");
            const variantsCell = document.createElement("td");
            variantsCell.colSpan = 8;

            const toggleBtn = document.createElement("button");
            toggleBtn.textContent = "🔽 Show Variants";
            toggleBtn.className = "btn btn-danger btn-sm";
            toggleBtn.addEventListener("click", async () => {
                const variantsDiv = document.getElementById(`variants-${product.productId}`);

                if (variantsDiv.style.display === "none") {
                    await loadVariantsInContainer(product.productId); // 🟢 încarcă datele
                    variantsDiv.style.display = "block";              // 🟢 arată div-ul
                    toggleBtn.textContent = "🔼 Hide Variants";        // 🟢 schimbă iconul
                } else {
                    variantsDiv.style.display = "none";               // 🔴 ascunde
                    toggleBtn.textContent = "🔽 Show Variants";        // 🔄 reset icon
                }
            });
            

            const variantsDiv = document.createElement("div");
            variantsDiv.id = `variants-${product.productId}`;
            variantsDiv.className = "variant-container";
            variantsDiv.style.display = "none";
            variantsDiv.style.marginTop = "10px";

            variantsCell.appendChild(toggleBtn);
            variantsCell.appendChild(variantsDiv);
            variantsRow.appendChild(variantsCell);

            row.querySelector(".desc-cell").style.cursor = "pointer";
            row.querySelector(".desc-cell").setAttribute("data-expanded", "false");

            tbody.appendChild(variantsRow); // 👈 și gata!
            // 🧠 activează expandarea descrierii pe click
            row.querySelector(".desc-cell").addEventListener("click", (e) => {
                const cell = e.currentTarget;
                const expanded = cell.getAttribute("data-expanded") === "true";

                if (expanded) {
                    cell.style.whiteSpace = "nowrap";
                    cell.style.overflow = "hidden";
                    cell.style.textOverflow = "ellipsis";
                    cell.setAttribute("data-expanded", "false");
                } else {
                    cell.style.whiteSpace = "normal";
                    cell.style.overflow = "visible";
                    cell.style.textOverflow = "clip";
                    cell.setAttribute("data-expanded", "true");
                }
            });

        }

        const addProductBtn = document.createElement("button");
        addProductBtn.textContent = "➕ Add Product";
        addProductBtn.className = "btn btn-danger btn-sm";
        addProductBtn.addEventListener("click", () => openProductModalAdd());

        container.appendChild(table);
        container.appendChild(addProductBtn);
        
        window.__dashboardRendered = true;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwt");
    if (!isAdminUser())
        return;

    setupCategoryModal(token);
    setupProductModal(token);
    setupVariantModal(token);

    if (document.getElementById("productTableContainer")) {
        if (!window.__dashboardRendered) {
            window.__dashboardRendered = true;
            renderDynamicDashboard();
        }
    }
});
