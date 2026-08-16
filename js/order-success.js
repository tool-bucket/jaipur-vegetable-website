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
        `<div style="margin:7px 0"><strong>${safe(item.name)}</strong> × ${item.quantity} (${safe(formatWeight(item.grams))}) = ₹${item.price * item.quantity}
        ${item.note ? `<div class="checkout-item-note" style="margin-top:5px"><i class="fa-regular fa-note-sticky"></i> ${safe(item.note)}</div>` : ""}</div>`
    ).join("");

    const locationHTML = order.location.googleMapsUrl
        ? `<p><strong>Delivery Location:</strong> <a href="${safe(order.location.googleMapsUrl)}" target="_blank" rel="noopener">Open in Google Maps</a></p>`
        : `<p><strong>Delivery Location:</strong> Address only</p>`;

    document.getElementById("orderDetails").innerHTML = `
        <p><strong>Customer:</strong> ${safe(order.customer.name)}</p>
        <p><strong>Mobile:</strong> ${safe(order.customer.phone)}</p>
        <p><strong>Address:</strong> ${safe(order.customer.address)}, ${safe(order.customer.city)} - ${safe(order.customer.pincode)}</p>
        ${order.customer.landmark ? `<p><strong>Landmark:</strong> ${safe(order.customer.landmark)}</p>` : ""}
        ${order.customer.notes ? `<p><strong>Delivery Note:</strong> ${safe(order.customer.notes)}</p>` : ""}
        <p><strong>Products:</strong></p>${items}
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
        `- ${item.name} (${formatWeight(item.grams)}) x ${item.quantity} = ₹${item.price * item.quantity}${item.note ? `\n  Product instruction: ${item.note}` : ""}`
    ).join("\n");

    return `FreshJaipur Order ${order.id}

Customer: ${order.customer.name}
Mobile: ${order.customer.phone}
Address: ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}
Landmark: ${order.customer.landmark || "N/A"}
Delivery Note: ${order.customer.notes || "N/A"}

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

function formatWeight(g){
    const n=Number(g)||0;
    if(n>=1000 && n%1000===0) return `${n/1000} kg`;
    if(n>=1000) return `${(n/1000).toFixed(2).replace(/\.00$/,"")} kg`;
    return `${n} g`;
}
