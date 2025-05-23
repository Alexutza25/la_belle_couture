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
    const userId = getUserIdFromToken();
    if (!token || !userId) return;

    try {
        const res = await fetch(`/api/User/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const user = await res.json();
        if (!user) return;

        document.querySelector("input[name='Name']").value = user.name || "";
        document.querySelector("input[name='Email']").value = user.email || "";
        document.querySelector("input[name='Phone']").value = user.phone || "";

        const addressRes = await fetch(`/api/User/address/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        const address = await addressRes.json();        document.querySelector("input[name='County']").value = address.county || "";
        document.querySelector("input[name='City']").value = address.city || "";
        document.querySelector("input[name='Street']").value = address.street || "";
        document.querySelector("input[name='Number']").value = address.number || "";
        document.querySelector("input[name='BuildingEntrance']").value = address.buildingEntrance || "";
        document.querySelector("input[name='Floor']").value = address.floor || "";
        document.querySelector("input[name='ApartmentNumber']").value = address.apartmentNumber || "";
        document.querySelector("textarea[name='AdditionalDetails']").value = address.additionalDetails || "";

    } catch (err) {
        console.error("❌ Failed to load user:", err);
    }

    // Load Orders
    try {
        const res = await fetch(`/api/Order/user/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const orders = await res.json();
        console.log("📦 Orders:", orders);

        const container = document.getElementById("orderList");

        if (orders.length === 0) {
            container.innerHTML = "<p>No orders found 🛒</p>";
            return;
        }

        container.innerHTML = "";
        orders.forEach(order => {
            const el = document.createElement("div");
            el.className = "order-card";

            let productsHtml = "";

            order.orderDetails.forEach(detail => {
                const variant = detail.productVariant;
                const product = variant.product;

                productsHtml += `
                <div class="order-product-detail" onclick="window.location.href='/Product?id=${product.productId}'" style="cursor: pointer;">
                    <img src="${product.imageURL || '/images/default-product.png'}" class="ordered-product-img" />
                    <div>
                        <p><strong>${product.name}</strong> (Size: ${variant.size})</p>
                        <p>Quantity: ${detail.quantity}</p>
                        <p>Price:$ ${detail.price} </p>
                        <p>Subtotal:$ ${detail.subtotal} </p>
                    </div>
                </div>
            `;

            });

            el.innerHTML = `
        <p><strong>Order #${order.orderId}</strong></p>
        <p>Status: ${order.status}</p>
        <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
        <p>Total:$ ${order.total} </p>
        <div class="order-products">${productsHtml}</div>
    `;
            container.appendChild(el);
        });

    } catch (err) {
        console.error("❌ Failed to load orders:", err);
    }
});

document.getElementById("profileForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwt");
    const userId = getUserIdFromToken();

    const userUpdate = {
        name: document.querySelector("input[name='Name']").value,
        email: document.querySelector("input[name='Email']").value,
        phone: document.querySelector("input[name='Phone']").value,
        address: {
            county: document.querySelector("input[name='County']").value,
            city: document.querySelector("input[name='City']").value,
            street: document.querySelector("input[name='Street']").value,
            number: document.querySelector("input[name='Number']").value,
            buildingEntrance: document.querySelector("input[name='BuildingEntrance']").value,
            floor: document.querySelector("input[name='Floor']").value,
            apartmentNumber: document.querySelector("input[name='ApartmentNumber']").value,
            additionalDetails: document.querySelector("textarea[name='AdditionalDetails']").value
        }
    };


    try {
        const res = await fetch(`/api/User/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(userUpdate)
        });

        if (!res.ok) throw new Error("❌ Update failed");
        showToast("✅ Profile updated successfully!");
    } catch (err) {
        console.error("❌ Failed to update profile:", err);
        showToast("⚠️ Failed to update.");
    }
});

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

