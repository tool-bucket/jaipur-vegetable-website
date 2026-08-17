/* =========================================================
   FRESHJAIPUR - CART
   Supports vegetable weights + bulk mala quantities.
========================================================= */
const CART_KEY = "freshjaipur_cart";
const PRICE_API = window.FRESHJAIPUR_API_URL || (location.origin + "/api");
let FRESHJAIPUR_VEGETABLE_PRICES = new Map();

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}
function getMoney(value) {
    return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}
function formatWeight(grams) {
    const g = Number(grams) || 0;
    if (!g) return "";
    if (g >= 1000 && g % 1000 === 0) return `${g / 1000} kg`;
    if (g >= 1000) return `${(g / 1000).toFixed(2).replace(/\.00$/, "")} kg`;
    return `${g} g`;
}
function formatItemUnit(item) {
    if (item.unit === "mala") {
        return `${Number(item.quantity || 0)} mala`;
    }
    return formatWeight(item.grams);
}
function getCartCount() {
    return getCart().reduce((n, item) => n + Number(item.quantity || 0), 0);
}
function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll(".cart-count").forEach(el => {
        el.textContent = count;
        el.classList.toggle("has-items", count > 0);
    });
}
function productFromCard(card) {
    const name = card.querySelector("h3")?.textContent.trim() || "Fresh Product";
    const category = card.querySelector(".product-category")?.textContent.trim() || "Fresh Produce";
    const image = card.querySelector("img")?.getAttribute("src") || "";
    const unit = card.dataset.unit || "kg";
    const productId = card.dataset.productId || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const liveProduct = unit === "kg" ? FRESHJAIPUR_VEGETABLE_PRICES.get(productId) : null;
    const priceText = card.querySelector(".product-price strong")?.textContent || "0";
    const price = liveProduct ? Number(liveProduct.price) : getMoney(priceText);
    const minQuantity = liveProduct ? Number(liveProduct.minQuantity || 250) : Number(card.dataset.minQuantity || 1);
    return { id: productId, name, pricePerKg: price, category, image, unit, minQuantity };
}

async function syncVegetablePrices() {
    try {
        const response = await fetch(PRICE_API + "/products/vegetables", { cache: "no-store" });
        if (!response.ok) return;
        const products = await response.json();
        FRESHJAIPUR_VEGETABLE_PRICES = new Map(
            (Array.isArray(products) ? products : []).map(product => [product.productId, product])
        );

        document.querySelectorAll(".product-card").forEach(card => {
            if (card.classList.contains("bulk-product")) return;
            const name = card.querySelector("h3")?.textContent.trim();
            if (!name) return;
            const productId = card.dataset.productId || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            const product = FRESHJAIPUR_VEGETABLE_PRICES.get(productId);
            if (!product) return;
            card.dataset.productId = product.productId;
            card.dataset.unit = product.unit;
            card.dataset.minQuantity = product.minQuantity;
            const priceEl = card.querySelector(".product-price strong");
            if (priceEl) priceEl.textContent = `₹${Number(product.price).toLocaleString("en-IN")}`;
        });
    } catch (error) {
        console.warn("FreshJaipur live vegetable prices unavailable; using page prices.", error);
    }
}
function showAddCelebration(product, amountLabel) {
    const overlay = document.createElement("div");
    overlay.className = "add-celebration";
    overlay.innerHTML = `
        <div class="celebration-glow"></div>
        <div class="celebration-content">
            <div class="celebration-emoji">🎉</div>
            <div class="celebration-title">Added to cart! 🥳</div>
            <div class="celebration-text">${escapeCart(product.name)} (${escapeCart(amountLabel)}) cart mein add ho gaya!</div>
            <a href="/cart/" class="celebration-cart-link">View Cart <i class="fa-solid fa-arrow-right"></i></a>
        </div>`;
    for (let i=0;i<22;i++) {
        const piece=document.createElement("span");
        piece.className="confetti-piece";
        piece.style.setProperty("--x",`${Math.random()*100-50}vw`);
        piece.style.setProperty("--r",`${Math.random()*720-360}deg`);
        piece.style.setProperty("--delay",`${Math.random()*.12}s`);
        overlay.appendChild(piece);
    }
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>overlay.classList.add("show"));
    setTimeout(()=>{ overlay.classList.remove("show"); setTimeout(()=>overlay.remove(),300); },1500);
}
function addToCart(product, grams) {
    grams = Number(grams);
    const minimumGrams = Number(product.minQuantity || 250);
    if (!Number.isFinite(grams) || grams < minimumGrams) {
        alert(`Minimum quantity ${formatWeight(minimumGrams)} hai.`);
        return;
    }
    const cart=getCart();
    const id=`${product.id}-${grams}`;
    const existing=cart.find(x=>x.id===id);
    const price=Math.round(product.pricePerKg*(grams/1000)*100)/100;
    if(existing) {
        existing.quantity += 1;
        if (typeof existing.note !== "string") existing.note = "";
    } else {
        cart.push({
            id, productId:product.id, name:product.name, price,
            pricePerKg:product.pricePerKg, grams, category:product.category,
            image:product.image, quantity:1, note:"", unit:"kg", minQuantity:Number(product.minQuantity || 250)
        });
    }
    saveCart(cart);
    showAddCelebration(product, formatWeight(grams));
}
function addBulkMalaToCart(product, quantity) {
    quantity = Number(quantity);
    const min = Number(product.minQuantity || 1);
    if (!Number.isInteger(quantity) || quantity < min) {
        alert(`${product.name} ke liye minimum ${min} mala ka bulk order hai.`);
        return false;
    }
    if (quantity > 50000) {
        alert("Please contact us directly for very large bulk orders.");
        return false;
    }
    const cart=getCart();
    const id=`${product.id}-bulk`;
    const existing=cart.find(x=>x.id===id);
    if(existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id, productId:product.id, name:product.name,
            price:product.pricePerKg, pricePerUnit:product.pricePerKg,
            category:product.category, image:product.image,
            quantity, note:"", unit:"mala", minQuantity:min, grams:0
        });
    }
    saveCart(cart);
    showAddCelebration(product, `${quantity} mala`);
    return true;
}
function getSelectedGrams(card, product) {
    const select = card.querySelector(".weight-select");
    if (!select) return 1000;
    if (select.value !== "custom") return Number(select.value);
    const custom = card.querySelector(".custom-weight-input");
    const kg = Number(custom?.value);
    const minimumKg = Number(product?.minQuantity || 250) / 1000;
    if (!Number.isFinite(kg) || kg < minimumKg) {
        alert(`Custom quantity kam se kam ${minimumKg} kg honi chahiye.`);
        custom?.focus();
        return null;
    }
    const grams = Math.round(kg * 1000);
    if (grams % 250 !== 0) {
        alert("Custom quantity 250 g ke steps mein dein, jaise 1.25 kg, 1.5 kg, 2 kg.");
        custom?.focus();
        return null;
    }
    return grams;
}
function getBulkQuantity(card) {
    const input = card.querySelector(".bulk-quantity-input");
    const quantity = Number(input?.value);
    const min = Number(card.dataset.minQuantity || 1);
    if (!Number.isInteger(quantity) || quantity < min) {
        alert(`Minimum ${min} mala ka bulk order hai.`);
        input?.focus();
        return null;
    }
    return quantity;
}
function initAddToCartButtons() {
    document.querySelectorAll(".product-card .add-cart-btn").forEach(button=>{
        if(button.dataset.cartReady==="true") return;
        button.dataset.cartReady="true";
        button.addEventListener("click", e=>{
            e.preventDefault();
            const card=button.closest(".product-card");
            if(!card) return;
            const product=productFromCard(card);
            if (product.unit === "mala") {
                const quantity = getBulkQuantity(card);
                if (!quantity) return;
                if (addBulkMalaToCart(product, quantity)) {
                    const old=button.innerHTML;
                    button.classList.add("added");
                    button.innerHTML='<i class="fa-solid fa-check"></i> Added';
                    setTimeout(()=>{button.classList.remove("added");button.innerHTML=old;},900);
                }
                return;
            }
            const grams=getSelectedGrams(card, product);
            if (!grams) return;
            addToCart(product, grams);
            const old=button.innerHTML;
            button.classList.add("added");
            button.innerHTML='<i class="fa-solid fa-check"></i> Added';
            setTimeout(()=>{button.classList.remove("added");button.innerHTML=old;},900);
        });
    });
}
function addWeightSelectors() {
    document.querySelectorAll(".product-card").forEach(card=>{
        if(card.classList.contains("bulk-product")) return;
        if(card.querySelector(".weight-select")) return;
        const priceEl=card.querySelector(".product-price");
        const addBtn=card.querySelector(".add-cart-btn");
        if(!priceEl || !addBtn) return;
        const wrap=document.createElement("div");
        wrap.className="weight-picker";
        const minimumGrams = Number(card.dataset.minQuantity || 250);
        const standardWeights = [250,500,1000,2000,5000].filter(g => g >= minimumGrams);
        if (!standardWeights.length) standardWeights.push(minimumGrams);
        const selectedWeight = standardWeights.includes(1000) ? 1000 : standardWeights[0];
        const options = standardWeights.map(g => `<option value="${g}" ${g===selectedWeight?'selected':''}>${formatWeight(g)}${g===250?' (¼ kg)':g===500?' (½ kg)':''}</option>`).join('');
        wrap.innerHTML=`<label>Quantity</label>
            <select class="weight-select" aria-label="Choose quantity">
              ${options}
              <option value="custom">Custom</option>
            </select>
            <input class="custom-weight-input" type="number" min="0.25" step="0.25" placeholder="kg" aria-label="Custom quantity in kilograms" hidden>`;
        const select=wrap.querySelector(".weight-select");
        const custom=wrap.querySelector(".custom-weight-input");
        select.addEventListener("change", ()=>{
            const show=select.value==="custom";
            custom.hidden=!show;
            if(show) custom.focus();
        });
        addBtn.parentNode.insertBefore(wrap, addBtn);
    });
}
async function initCartFeatures() {
    await syncVegetablePrices();
    addWeightSelectors();
    initAddToCartButtons();
    updateCartCount();
}
function escapeCart(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
}
document.addEventListener("DOMContentLoaded", initCartFeatures);
document.addEventListener("freshjaipur:componentsLoaded", initCartFeatures);
