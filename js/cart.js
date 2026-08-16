document.addEventListener("DOMContentLoaded", initCheckout);
document.addEventListener("freshjaipur:componentsLoaded", initCheckout);

let checkoutReady = false;

function initCheckout() {
    if (checkoutReady) return;

    const form = document.getElementById("checkoutForm");
    if (!form) return;

    checkoutReady = true;

    const cart = getCart();

    if (!cart.length) {
        window.location.href = "/cart/";
        return;
    }

    renderCheckoutItems(cart);

    document.getElementById("useLocation")?.addEventListener("click", useCurrentLocation);
    document.getElementById("addressOnMap")?.addEventListener("click", findAddressOnMap);
    form.addEventListener("submit", placeOrder);
}

function renderCheckoutItems(cart) {
    let subtotal = 0;

    const html = cart.map(item => {
        subtotal += item.price * item.quantity;
        return `
            <div class="checkout-product-summary">
                <div class="summary-row">
                    <span>${escapeCheckout(item.name)} × ${item.quantity}<small>${escapeCheckout(formatCheckoutWeight(item.grams))}</small></span>
                    <strong>₹${item.price * item.quantity}</strong>
                </div>
                ${item.note ? `<div class="checkout-item-note"><i class="fa-regular fa-note-sticky"></i> ${escapeCheckout(item.note)}</div>` : ""}
            </div>
        `;
    }).join("");

    document.getElementById("checkoutItems").innerHTML = html;
    document.getElementById("checkoutSubtotal").textContent = `₹${subtotal}`;
    document.getElementById("checkoutTotal").textContent = `₹${subtotal}`;
}

function useCurrentLocation() {
    const status = document.getElementById("locationStatus");

    if (!navigator.geolocation) {
        status.textContent = "Your browser does not support location access. Please use Find Address on Map.";
        return;
    }

    status.textContent = "Getting your current location…";

    navigator.geolocation.getCurrentPosition(
        position => {
            setMapLocation(position.coords.latitude, position.coords.longitude, "Current location selected.");
        },
        error => {
            status.textContent = "Location access was not allowed. Please enable location permission and try again.";
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
}

function findAddressOnMap() {
    const address = [
        document.getElementById("address")?.value,
        document.getElementById("landmark")?.value,
        document.getElementById("pincode")?.value,
        document.getElementById("city")?.value
    ].filter(Boolean).join(", ");

    if (!address) {
        document.getElementById("address")?.focus();
        document.getElementById("locationStatus").textContent = "Please enter your address first.";
        return;
    }

    const encoded = encodeURIComponent(address);
    document.getElementById("googleMapFrame").src =
        `https://www.google.com/maps?q=${encoded}&output=embed`;

    document.getElementById("locationStatus").textContent =
        "Address loaded on Google Maps. For an exact delivery pin, use 'Use My Current Location'.";
}

function setMapLocation(lat, lng, message) {
    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lng;

    document.getElementById("googleMapFrame").src =
        `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;

    document.getElementById("locationStatus").innerHTML =
        `${message} <strong>Lat:</strong> ${Number(lat).toFixed(6)} · <strong>Lng:</strong> ${Number(lng).toFixed(6)} · <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener">Open in Google Maps</a>`;
}

async function placeOrder(event) {
    event.preventDefault();

    const cart = getCart();
    if (!cart.length) {
        window.location.href = "/cart/";
        return;
    }

    const form = event.currentTarget;
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal < 200) {
        alert("FreshJaipur ka minimum order ₹200 hai. Kripya cart mein aur products add karein.");
        window.location.href = "/cart/";
        return;
    }

    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;

    if (!latitude || !longitude) {
        const okay = confirm("Exact map location select nahi hui hai. Kya aap phir bhi order place karna chahte hain?");
        if (!okay) return;
    }

    const data = new FormData(form);
    const order = {
        id: "FJ-" + Date.now().toString().slice(-8),
        createdAt: new Date().toISOString(),
        customer: {
            name: data.get("customerName"),
            phone: data.get("phone"),
            address: data.get("address"),
            landmark: data.get("landmark"),
            pincode: data.get("pincode"),
            city: data.get("city"),
            notes: data.get("notes")
        },
        location: {
            latitude: latitude || null,
            longitude: longitude || null,
            googleMapsUrl: latitude && longitude
                ? `https://www.google.com/maps?q=${latitude},${longitude}`
                : ""
        },
        items: cart.map(item => ({
            ...item,
            note: String(item.note || "").slice(0,300)
        })),
        subtotal,
        total: subtotal
    };

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...';
    }

    try {
        const apiUrl = window.FRESHJAIPUR_API_URL || "https://freshjaipur-api.onrender.com/api";

        const response = await fetch(`${apiUrl}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer: order.customer,
                location: order.location,
                items: order.items,
                subtotal: order.subtotal,
                total: order.total
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Order could not be received.");
        }

        order.id = result.orderId;
        localStorage.setItem("freshjaipur_last_order", JSON.stringify(order));
        localStorage.removeItem(CART_KEY);

        window.location.href = "/order-success/";
    } catch (error) {
        console.error(error);
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fa-solid fa-check"></i> Place Order';
        }
        alert("Order receive nahi ho paya. Please check backend connection and try again.");
    }
}

function formatCheckoutWeight(g) {
    const n = Number(g) || 0;
    if (n >= 1000 && n % 1000 === 0) return `${n / 1000} kg`;
    if (n >= 1000) return `${(n / 1000).toFixed(2).replace(/\.00$/, "")} kg`;
    return `${n} g`;
}

function escapeCheckout(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[char]));
}
