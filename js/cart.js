/* =========================================================
   FRESHJAIPUR - CART
   Supports preset weights + custom quantities above 1kg.
========================================================= */
const CART_KEY = "freshjaipur_cart";

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
    if (g >= 1000 && g % 1000 === 0) return `${g / 1000} kg`;
    if (g >= 1000) return `${(g / 1000).toFixed(2).replace(/\.00$/, "")} kg`;
    return `${g} g`;
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
    const priceText = card.querySelector(".product-price strong")?.textContent || "0";
    const price = getMoney(priceText);
    const category = card.querySelector(".product-category")?.textContent.trim() || "Fresh Produce";
    const image = card.querySelector("img")?.getAttribute("src") || "";
    return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name, pricePerKg: price, category, image
    };
}
function showAddCelebration(product, weight) {
    const overlay = document.createElement("div");
    overlay.className = "add-celebration";
    overlay.innerHTML = `
        <div class="celebration-glow"></div>
        <div class="celebration-content">
            <div class="celebration-emoji">🎉</div>
            <div class="celebration-title">Urrreee! 🥳</div>
            <div class="celebration-text">${escapeCart(product.name)} (${formatWeight(weight)}) cart mein add ho gaya!</div>
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
    if (!Number.isFinite(grams) || grams < 250) {
        alert("Minimum quantity 250 g hai.");
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
            image:product.image, quantity:1, note:""
        });
    }
    saveCart(cart);
    showAddCelebration(product, grams);
}
function getSelectedGrams(card) {
    const select = card.querySelector(".weight-select");
    if (!select) return 1000;
    if (select.value !== "custom") return Number(select.value);

    const custom = card.querySelector(".custom-weight-input");
    const kg = Number(custom?.value);
    if (!Number.isFinite(kg) || kg < 0.25) {
        alert("Custom quantity kam se kam 0.25 kg honi chahiye.");
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
function initAddToCartButtons() {
    document.querySelectorAll(".product-card .add-cart-btn").forEach(button=>{
        if(button.dataset.cartReady==="true") return;
        button.dataset.cartReady="true";
        button.addEventListener("click", e=>{
            e.preventDefault();
            const card=button.closest(".product-card");
            if(!card) return;
            const product=productFromCard(card);
            const grams=getSelectedGrams(card);
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
        if(card.querySelector(".weight-select")) return;
        const priceEl=card.querySelector(".product-price");
        const addBtn=card.querySelector(".add-cart-btn");
        if(!priceEl || !addBtn) return;

        const wrap=document.createElement("div");
        wrap.className="weight-picker";
        wrap.innerHTML=`<label>Quantity</label>
            <select class="weight-select" aria-label="Choose quantity">
              <option value="250">250 g (¼ kg)</option>
              <option value="500">500 g (½ kg)</option>
              <option value="1000" selected>1 kg</option>
              <option value="2000">2 kg</option>
              <option value="5000">5 kg</option>
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
function initCartFeatures() {
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
