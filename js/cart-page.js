document.addEventListener("DOMContentLoaded", renderCartPage);
document.addEventListener("freshjaipur:componentsLoaded", renderCartPage);

function renderCartPage() {
    const root=document.getElementById("cartPage");
    if(!root) return;
    const cart=getCart();

    if(!cart.length){
        root.innerHTML=`<div class="shop-card empty-cart">
          <div class="empty-cart-icon"><i class="fa-solid fa-basket-shopping"></i></div>
          <h2>Your cart is empty</h2><p>Add some fresh vegetables to get started.</p>
          <a class="shop-primary-btn" style="max-width:260px;margin:20px auto 0;" href="/vegetables/"><i class="fa-solid fa-leaf"></i> Browse Vegetables</a>
        </div>`;
        return;
    }

    let subtotal=0;
    const items=cart.map(item=>{
        const total=item.price*item.quantity;
        subtotal+=total;
        const note=item.note || "";
        return `<article class="cart-item">
          <div class="cart-item-image"><img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"></div>
          <div class="cart-item-main">
            <h3>${esc(item.name)}</h3>
            <div class="cart-item-meta">${esc(item.category)} · ${formatWeight(item.grams)} · ₹${item.price} / pack</div>
            <div class="cart-item-price">₹${item.price} per ${formatWeight(item.grams)}</div>
            <div class="quantity-control">
              <button type="button" aria-label="Decrease quantity" onclick="changeCartQty('${js(item.id)}',-1)">−</button>
              <span>${item.quantity}</span>
              <button type="button" aria-label="Increase quantity" onclick="changeCartQty('${js(item.id)}',1)">+</button>
            </div>
            <label class="cart-note-label" for="note-${cssId(item.id)}">
              <i class="fa-regular fa-note-sticky"></i> Special instruction for this product
            </label>
            <textarea id="note-${cssId(item.id)}" class="cart-item-note"
              maxlength="300" 
              onchange="updateCartNote('${js(item.id)}', this.value)">${esc(note)}</textarea>
            <div class="cart-note-help">Optional · Up to 300 characters</div>
          </div>
          <div class="cart-item-total">₹${total}
            <button type="button" class="remove-item" onclick="removeCartItem('${js(item.id)}')"><i class="fa-regular fa-trash-can"></i> Remove</button>
          </div>
        </article>`;
    }).join("");

    root.innerHTML=`<div class="cart-toolbar">
        <span><i class="fa-solid fa-shield-heart"></i> Your cart is saved on this device</span>
        <button type="button" class="clear-cart-btn" onclick="clearEntireCart()"><i class="fa-regular fa-trash-can"></i> Clear Cart</button>
      </div>
      <div class="cart-layout">
      <div class="shop-card cart-list">${items}</div>
      <aside class="shop-card summary-card">
        <h2>Order Summary</h2>
        <div class="summary-row"><span>Items</span><strong>${getCartCount()}</strong></div>
        <div class="summary-row"><span>Products</span><strong>${cart.length}</strong></div>
        <div class="summary-row"><span>Subtotal</span><strong>₹${subtotal}</strong></div>
        <div class="summary-row"><span>Delivery</span><strong>Calculated at checkout</strong></div>
        <div class="summary-row total"><span>Total</span><strong>₹${subtotal}</strong></div>
        <div class="minimum-order-note"><i class="fa-solid fa-circle-info"></i>
          ${subtotal >= 200
            ? `<strong>Minimum order reached ✓</strong>`
            : `Add <strong>₹${200 - subtotal}</strong> more to reach the ₹200 minimum order.`}
        </div>
        ${subtotal >= 200
            ? `<a class="shop-primary-btn" href="/checkout/">Proceed to Checkout <i class="fa-solid fa-arrow-right"></i></a>`
            : `<button type="button" class="shop-primary-btn disabled-btn" onclick="showMinimumOrderMessage()">Proceed to Checkout <i class="fa-solid fa-arrow-right"></i></button>`}
        <a class="shop-secondary-btn" href="/vegetables/"><i class="fa-solid fa-plus"></i> Add More Products</a>
      </aside>
    </div>`;
}
function changeCartQty(id,amount){
    const cart=getCart(), item=cart.find(x=>x.id===id); if(!item)return;
    item.quantity+=amount;
    if(item.quantity<=0) saveCart(cart.filter(x=>x.id!==id)); else saveCart(cart);
    renderCartPage();
}
function removeCartItem(id){
    saveCart(getCart().filter(x=>x.id!==id));
    renderCartPage();
}
function updateCartNote(id, note){
    const cart=getCart();
    const item=cart.find(x=>x.id===id);
    if(!item) return;
    item.note=String(note || "").slice(0,300);
    saveCart(cart);
}
function clearEntireCart(){
    if(!getCart().length) return;
    if(confirm("Kya aap poora cart clear karna chahte hain?")) {
        saveCart([]);
        renderCartPage();
    }
}
function formatWeight(g){
    const n=Number(g)||0;
    if(n>=1000 && n%1000===0) return `${n/1000} kg`;
    if(n>=1000) return `${(n/1000).toFixed(2).replace(/\.00$/,"")} kg`;
    return `${n} g`;
}
function esc(v){
    return String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function js(v){return String(v).replace(/\\/g,"\\\\").replace(/'/g,"\\'");}
function cssId(v){return String(v).replace(/[^a-zA-Z0-9_-]/g,"-");}
function showMinimumOrderMessage(){
    alert("FreshJaipur ka minimum order ₹200 hai. Kripya cart mein aur products add karein.");
}
