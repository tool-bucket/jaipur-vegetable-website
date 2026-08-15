
document.addEventListener("DOMContentLoaded", initSuccess);

function initSuccess() {
    const order = JSON.parse(localStorage.getItem("freshjaipur_last_order") || "null");

    if (!order) {
        document.getElementById("orderDetails").innerHTML =
            "<p>Order details are not available on this device.</p>";
        return;
    }

    document.getElementById("orderId").textContent = `Order ID: ${order.id}`;

    const items = order.items.map(item =>
        `${item.name} × ${item.quantity} = ₹${item.price * item.quantity}`
    ).join("<br>");

    const locationHTML = order.location.googleMapsUrl
        ? `<p><strong>Delivery Location:</strong> <a href="${order.location.googleMapsUrl}" target="_blank" rel="noopener">Open in Google Maps</a></p>`
        : `<p><strong>Delivery Location:</strong> Address only</p>`;

    document.getElementById("orderDetails").innerHTML = `
        <p><strong>Customer:</strong> ${safe(order.customer.name)}</p>
        <p><strong>Mobile:</strong> ${safe(order.customer.phone)}</p>
        <p><strong>Address:</strong> ${safe(order.customer.address)}, ${safe(order.customer.city)} - ${safe(order.customer.pincode)}</p>
        ${order.customer.landmark ? `<p><strong>Landmark:</strong> ${safe(order.customer.landmark)}</p>` : ""}
        <p><strong>Products:</strong><br>${items}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        ${locationHTML}
    `;

    document.getElementById("copyOrder").addEventListener("click", async () => {
        const text = makeOrderText(order);
        try {
            await navigator.clipboard.writeText(text);
            document.getElementById("copyOrder").innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        } catch {
            alert(text);
        }
    });

    const number = window.FRESHJAIPUR_CONFIG?.whatsappNumber || "";
    if (number) {
        const link = document.getElementById("whatsappOrder");
        link.href = `https://wa.me/${number}?text=${encodeURIComponent(makeOrderText(order))}`;
        link.style.display = "inline-flex";
    }
}

function makeOrderText(order) {
    const items = order.items.map(item =>
        `- ${item.name} (${formatWeight(item.grams)}) x ${item.quantity} = ₹${item.price * item.quantity}`
    ).join("\n");

    return `FreshJaipur Order ${order.id}

Customer: ${order.customer.name}
Mobile: ${order.customer.phone}
Address: ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}
Landmark: ${order.customer.landmark || "N/A"}

Products:
${items}

Total: ₹${order.total}

Delivery Location:
${order.location.googleMapsUrl || "No exact coordinates selected"}`;
}

function safe(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[char]));
}

function formatWeight(g){return g>=1000&&g%1000===0?`${g/1000} kg`:`${g} g`;}
