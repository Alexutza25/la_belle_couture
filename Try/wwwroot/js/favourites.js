function showSideToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // poziționare stânga jos
    /*toast.style.position = "fixed";
    toast.style.bottom = "1rem";
    toast.style.right = "1rem";
    toast.style.padding = "1rem 2rem";
    toast.style.backgroundColor = type === "success" ? "#d66b71" : "#b73535";
    toast.style.color = "white";
    toast.style.borderRadius = "25px";
    toast.style.fontWeight = "bold";
    toast.style.zIndex = 3000;
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";*/

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwt");
    const container = document.getElementById("favouritesContainer");

    const res = await fetch("/api/favourite/my", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        container.innerHTML = "<p>❌ Couldn't load favourites</p>";
        return;
    }

    const favourites = await res.json();
    console.log("🧪 Favourites:", favourites);


    if (favourites.length === 0) {
        container.innerHTML = "<p>😢 No favourites yet!</p>";
        return;
    }

    favourites.forEach(fav => {
        const variant = fav.productVariant;

        const card = document.createElement("div");
        card.className = "favourite-card";
        const product = variant?.product;

        const inStock = variant?.stock > 0;
        const stockText = inStock ? "In stock" : "Out of stock";
        const stockClass = inStock ? "in-stock" : "out-of-stock";

        card.innerHTML = `
          <img src="${product?.imageURL || 'https://via.placeholder.com/150'}" alt="${product?.name || 'No name'}" class="product-image" />
          <div class="favourite-info">
              <h3>${product?.name || 'Unknown Product'}</h3>
              <p class="${stockClass}"><strong>${stockText}</strong></p>
              <p><strong>Size:</strong> ${variant?.size}</p>
              <p><strong>Price:</strong> ${product?.price ? product.price + '$' : 'Unavailable'}</p>
              <button class="btn-remove" data-id="${fav.favouriteId}">🗑️ Remove</button>
          </div>
`;


        card.setAttribute("data-productid", product?.productId);
        card.setAttribute("data-size", variant?.size);

// event click pe cardul întreg (fără să apese pe butonul Remove)
        card.addEventListener("click", (e) => {
            // să nu interfereze clickul pe butonul Remove
            if (e.target.classList.contains("btn-remove")) return;

            const productId = card.getAttribute("data-productid");
            const size = card.getAttribute("data-size");

            window.location.href = `/Product?id=${productId}&size=${size}`;
        });


        container.appendChild(card);
    });

    // 🔥 Remove handler
    container.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-remove")) return;

        const btn = e.target;
        const id = btn.dataset.id;
        const confirmToast = document.getElementById("confirmToast");
        const confirmYes = document.getElementById("confirmYes");
        const confirmNo = document.getElementById("confirmNo");

        confirmToast.classList.remove("hidden");

        function cleanup() {
            confirmYes.removeEventListener("click", onYes);
            confirmNo.removeEventListener("click", onNo);
            confirmToast.classList.add("hidden");
        }

        function onYes() {
            cleanup();
            // aici faci delete-ul
            fetch(`/api/Favourite/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => {
                    if (res.ok) {
                        btn.closest(".favourite-card").remove();
                        showSideToast("🗑️ Deleted successfully!");
                    } else {
                        alert("❌ Failed to remove");
                    }
                });
        }

        function onNo() {
            cleanup();
        }

        confirmYes.addEventListener("click", onYes);
        confirmNo.addEventListener("click", onNo);
    });
});