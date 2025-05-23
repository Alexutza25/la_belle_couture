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


document.addEventListener("DOMContentLoaded", () => {
    const address = JSON.parse(localStorage.getItem("order_address"));
    const cart = JSON.parse(localStorage.getItem("cart"));

    if (address) {
        document.querySelector("input[name='County']").value = address.county || "";
        document.querySelector("input[name='City']").value = address.city || "";
        document.querySelector("input[name='Street']").value = address.street || "";
        document.querySelector("input[name='Number']").value = address.number || "";
        document.querySelector("input[name='BuildingEntrance']").value = address.buildingEntrance || "";
        document.querySelector("input[name='Floor']").value = address.floor || "";
        document.querySelector("input[name='ApartmentNumber']").value = address.apartmentNumber || "";
        document.querySelector("textarea[name='AdditionalDetails']").value = address.additionalDetails || "";
    }

    if (cart) {
        const container = document.getElementById("orderedProducts");
        container.innerHTML = "";

        cart.forEach(item => {
            const name = item.productVariant.product.name;
            const price = item.productVariant.product.price;
            const quantity = item.quantity;

            const el = document.createElement("div");
            el.classList.add("order-product");
            el.innerHTML = `
        <div class="ordered-product-info">
            <img src="${item.productVariant.product.imageURL || '/images/default-product.png'}" alt="${name}" class="ordered-product-img" />
            <div>
                <strong>${name}</strong><br/>
                ${quantity} x ${price} RON
            </div>
        </div>
    `;

            container.appendChild(el);
        });
    }
    
});

document.querySelector(".order-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");
    const userId = getUserIdFromToken();
    const cart = JSON.parse(localStorage.getItem("cart"));

    if (!cart || cart.length === 0) return;

    const orderDto = {
        userId: parseInt(getUserIdFromToken()),
        paymentMethod: document.querySelector("select[name='paymentMethod']").value,
        orderDetails: cart.map(item => {
            const price = item.productVariant.product.price;
            const quantity = item.quantity;
            return {
                variantId: item.productVariant.variantId,
                quantity: quantity,
                price: price,
                subtotal: price * quantity
            };
        })
    };


    try {
        const res = await fetch("/api/Order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(orderDto)
        });
        console.log("🧾 orderDto:", orderDto);


        if (!res.ok) throw new Error("Failed to save order");

        // 🧼 Golește cart-ul
        await fetch(`/api/Cart/clear/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        localStorage.removeItem("cart");
        console.log("🚀 Payload trimis spre /api/Order:", orderDto);

        showToast("💖 Thank you for ordering from La Belle Couture!");
        console.log("‼️ NU ar trebui să fim redirecționați acum.");

        setTimeout(() => {
            window.location.href = "/Index";
        }, 2500);
    } catch (err) {
        console.error("❌ Failed to place order:", err);
        showToast("❌ Failed to place order", "error");
    }
});

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}




