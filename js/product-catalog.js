/* FreshJaipur dynamic catalog additions. Existing static products remain untouched. */
(function () {
  const api = window.FRESHJAIPUR_API_URL;
  if (!api) return;

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
    }[c]));
  }

  function existingIds(selector) {
    return new Set([...document.querySelectorAll(selector)].map(el => el.dataset.productId).filter(Boolean));
  }

  function vegetableCard(product) {
    return `<article class="product-card dynamic-product" data-product-id="${esc(product.productId)}" data-unit="kg" data-min-quantity="${Number(product.minQuantity || 250)}">
      <div class="product-image-area">
        <span class="fresh-badge"><i class="fa-solid fa-leaf"></i> Fresh</span>
        <button class="wishlist-btn" aria-label="Add ${esc(product.name)} to wishlist"><i class="fa-regular fa-heart"></i></button>
        <div class="product-real-image"><img src="${esc(product.image || '/assets/favicon (1).jpg')}" alt="${esc(product.name)} online in Jaipur" loading="lazy" width="700" height="700"></div>
      </div>
      <div class="product-content">
        <div class="product-category">${esc(product.category || 'Fresh Produce')}</div>
        <h3>${esc(product.name)}</h3>
        <p class="product-description">${esc(product.description || 'Fresh, carefully selected produce for everyday cooking.')}</p>
        <div class="product-bottom">
          <div class="product-price"><strong>₹${Number(product.price).toLocaleString('en-IN')}</strong><span>/ kg</span></div>
          <button class="add-cart-btn" type="button"><i class="fa-solid fa-plus"></i> Add</button>
        </div>
      </div>
    </article>`;
  }

  function malaCard(product) {
    const min = Number(product.minQuantity || 1);
    return `<article class="product-card bulk-product dynamic-product" data-unit="mala" data-min-quantity="${min}" data-product-id="${esc(product.productId)}">
      <div class="product-image-area mala-image-area">
        <span class="fresh-badge"><i class="fa-solid fa-leaf"></i> Fresh</span>
        <button class="wishlist-btn" aria-label="Add ${esc(product.name)} to wishlist"><i class="fa-regular fa-heart"></i></button>
        <div class="product-real-image"><img src="${esc(product.image || '/assets/favicon (1).jpg')}" alt="${esc(product.name)} for bulk order in Jaipur" loading="lazy" width="800" height="800"></div>
      </div>
      <div class="product-content">
        <div class="product-category">${esc(product.category || 'Bulk Mala')}</div>
        <h3>${esc(product.name)}</h3>
        <p class="product-description">${esc(product.description || 'Fresh flower malas for bulk functions and events.')}</p>
        <div class="bulk-min-badge"><i class="fa-solid fa-boxes-stacked"></i> Minimum ${min} malas</div>
        <div class="product-bottom">
          <div class="product-price"><strong class="mala-live-price">₹${Number(product.price).toLocaleString('en-IN')}</strong><span>/ mala*</span></div>
          <button class="add-cart-btn" type="button"><i class="fa-solid fa-plus"></i> Add Bulk Order</button>
        </div>
        <div class="bulk-quantity-wrap"><label>Number of malas</label><input class="bulk-quantity-input" type="number" min="${min}" step="1" value="${min}" inputmode="numeric" aria-label="Number of ${esc(product.name)}"></div>
      </div>
    </article>`;
  }

  async function loadDynamicProducts() {
    const isMalaPage = Boolean(document.querySelector('.mala-grid'));
    const isVegPage = Boolean(document.querySelector('.products-grid:not(.mala-grid)'));
    if (!isMalaPage && !isVegPage) return;

    try {
      const response = await fetch(api + '/products', { cache: 'no-store' });
      if (!response.ok) return;
      const products = await response.json();
      if (!Array.isArray(products)) return;

      if (isVegPage) {
        const grid = document.querySelector('.products-grid:not(.mala-grid)');
        const ids = existingIds('.products-grid:not(.mala-grid) .product-card');
        const additions = products.filter(p => p.unit === 'kg' && !ids.has(p.productId));
        if (additions.length) {
          grid.insertAdjacentHTML('beforeend', additions.map(vegetableCard).join(''));
        }
      }

      if (isMalaPage) {
        const grid = document.querySelector('.mala-grid');
        const ids = existingIds('.mala-grid .product-card');
        const additions = products.filter(p => p.unit === 'mala' && !ids.has(p.productId));
        if (additions.length) {
          grid.insertAdjacentHTML('beforeend', additions.map(malaCard).join(''));
        }
      }

      if (typeof window.initCartFeatures === 'function') await window.initCartFeatures();
    } catch (error) {
      console.warn('Dynamic FreshJaipur products unavailable:', error);
    }
  }

  document.addEventListener('DOMContentLoaded', loadDynamicProducts);
  document.addEventListener('freshjaipur:componentsLoaded', loadDynamicProducts);
})();
