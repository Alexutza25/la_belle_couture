function getUserIdFromToken() {
    const token = localStorage.getItem("jwt");
    if (!token) return null;

    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    } catch (e) {
        console.error("❌ Invalid token:", e);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwt");
    const UserId = getUserIdFromToken();

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const selectedSizeFromUrl = urlParams.get("size");
    if (!id) return;

    try {
        const res = await fetch(`/api/Product/${id}`);
        const product = await res.json();
        console.log("📦 Product loaded:", product);
        console.log("📦 Category ID:", product.categoryId);

        // ✅ După ce ai obținut produsul curent
        const categoryId = product.categoryId;
        console.log("📦 Category ID:", product.categoryId);


// 🔄 Ia toate produsele din aceeași categorie
        const categoryRes = await fetch(`/api/Product/category/${categoryId}`);
        const categoryProducts = await categoryRes.json();

// 🧹 Curățăm div-ul înainte de a popula
        const boughtTogetherContainer = document.getElementById("boughtTogether");
        boughtTogetherContainer.innerHTML = "";

// 🔁 Adăugăm fiecare produs, dar excludem produsul curent
        categoryProducts
            .filter(p => p.productId !== product.productId)
            .slice(0, 4) // limităm la 4 produse
            .forEach(p => {
                const productCard = document.createElement("div");
                productCard.classList.add("related-product-card");

                productCard.innerHTML = `
            <a href="/Product?id=${p.productId}">
                <img src="${p.imageURL || '/images/default-product.png'}" alt="${p.name}" class="related-product-image">
                <h4 class="related-product-name">${p.name}</h4>
                <p class="related-product-price">${p.price} RON</p>
            </a>
        `;

                boughtTogetherContainer.appendChild(productCard);
            });


        // 💄 Populate page elements
        document.getElementById("productImage").src = product.imageURL || "/images/default-product.png";

        // 🎯 Product variants
        const variantsRes = await fetch("/api/ProductVariant");
        const variants = await variantsRes.json();
        const productVariants = variants.filter(v => v.productId === product.productId);

        const availabilityElem = document.getElementById("availability");
        const options = document.getElementById("options");
        options.innerHTML = "";


        const sizeLabel = document.createElement("label");
        sizeLabel.setAttribute("for", "sizeSelect");
        sizeLabel.textContent = "Select size:";
        options.appendChild(sizeLabel);

        const sizeSelect = document.createElement("select");
        sizeSelect.id = "sizeSelect";
        options.appendChild(sizeSelect);

        let firstValidSize = null;

        productVariants.forEach(v => {
            const size = v.size.trim();
            const opt = document.createElement("option");
            opt.value = size;
            opt.textContent = `Size ${size}`;
            sizeSelect.appendChild(opt);
            if (!firstValidSize) firstValidSize = size;
        });


        const details = document.getElementById("productDetails");
        details.innerHTML = `
        <h1>${product.name}</h1>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Price:</strong> 💸 ${product.price} $</p>
        <p><strong>Description:</strong> ${product.description}</p>
`;

        function updateAvailability(selectedSize) {
            const variant = productVariants.find(v =>
                v.size.trim().toLowerCase() === selectedSize.trim().toLowerCase()
            );

            if (!variant) {
                availabilityElem.innerHTML = `<span class="unknown">-</span>`;
                return;
            }

            if (variant.stock > 5) {
                availabilityElem.innerHTML = `<span class="in-stock">✅ In stock</span>`;
            } else if (variant.stock > 0) {
                availabilityElem.innerHTML = `<span class="low-stock">⚠️ Only ${variant.stock} left</span>`;
            } else {
                availabilityElem.innerHTML = `<span class="out-stock">❌ Out of stock</span>`;
            }
        }


        let selectedSize = selectedSizeFromUrl;
        if (selectedSize && Array.from(sizeSelect.options).some(opt => opt.value === selectedSize)) {
            sizeSelect.value = selectedSize;
        } else if (firstValidSize) {
            sizeSelect.value = firstValidSize;
            selectedSize = firstValidSize;
        }
        updateAvailability(sizeSelect.value);

        sizeSelect.addEventListener("change", (e) => {
            updateAvailability(e.target.value);
        });

        if (product.colour) {
            const colourP = document.createElement("p");
            colourP.innerHTML = `🎨 <strong>Colour:</strong> ${product.colour}`;
            options.appendChild(colourP);
        }
        if (product.material) {
            const materialP = document.createElement("p");
            materialP.innerHTML = `🧵 <strong>Material:</strong> ${product.material}`;
            options.appendChild(materialP);
        }
        // ❤️ Add to Favourites
        document.getElementById("addToFavourites").addEventListener("click", () => {
            const selectedSize = sizeSelect.value;
            if (!selectedSize) return showToast("⚠️ Please select a size!", "error");

            const selectedVariant = productVariants.find(v =>
                v.size.trim().toLowerCase() === selectedSize.trim().toLowerCase()
            );
            if (!selectedVariant || !UserId) return showToast("❌ Missing data.", "error");
            console.log("Sending to favourites:", {
                userId: UserId,
                productVariantId: selectedVariant
            });

            addToFavourites(selectedVariant.variantId, UserId, token);
        });

        document.getElementById("addToCart").addEventListener("click", () => {
            const selectedSize = document.getElementById("sizeSelect").value;

            if (!selectedSize) {
                return showToast("⚠️ Please select a size!", "error");
            }

            const selectedVariant = productVariants.find(v =>
                v.size.trim().toLowerCase() === selectedSize.trim().toLowerCase()
            );

            if (!selectedVariant || !UserId) {
                return showToast("❌ Missing data.", "error");
            }

            addToCart(selectedVariant.variantId, UserId, token);
        });


        if (typeof isAdminUser === "function" && isAdminUser()) {
            document.body.classList.add("with-sidebar");
        }

    } catch (err) {
        console.error("💥 Failed to load product:", err);
        document.getElementById("productPage").innerHTML = "<p>❌ Failed to load product.</p>";
    }
});

function addToFavourites(ProductVariantId, UserId, token) {
        fetch("/api/Favourite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            },
            body: JSON.stringify({
                userId: parseInt(UserId),
                variantId: ProductVariantId
            })
        })
            .then(async res => {
                const msg = await res.text();
                console.log("📥 Răspuns server:", msg);

                if (res.ok) {
                    showToast("❤️ Added to favourites!");
                } else {
                    showToast("❌ Failed to add", "error");
                    console.warn("❌ Răspuns NEOK:", msg);
                }
            })

            .catch(err => {
                console.error("💥 Eroare rețea:", err);
                showToast("❌ Error sending request", "error");
            });
    

}

function addToCart(ProductVariantId, UserId, token) {
    fetch("/api/Cart/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
            userId: parseInt(UserId),
            variantId: ProductVariantId,
            Quantity: 1 
        })
        
    })
        .then(res => {
            if (res.ok) {
                showToast("🛒 Added to cart!");
            } else {
                showToast("❌ Failed to add to cart", "error");
                res.text().then(msg => console.warn("❌ Cart Error Body:", msg));
            }
        })
        .catch(err => {
            console.error("💥 Eroare rețea Cart:", err);
            showToast("❌ Error sending cart request", "error");
        });
    
}


function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
