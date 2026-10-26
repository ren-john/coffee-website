import './styles.css';
import './store.css';
import { catalog, findProduct, filterCatalog, formatPrice, type Product } from './data/catalog';
import { BAG_KEY, browserStorage, createCart, itemKey, normalizeBag, totals, unitPrice, type CartItem, type Delivery } from './data/cart';
import { productArt, productCard, productOptions, escapeHTML as esc } from './ui/productViews';

const root = document.querySelector<HTMLElement>('#store-content')!;
const storage = browserStorage(), cart = createCart(storage);
const ordersKey = 'mr-bean-demo-orders-v1';
type Order = { id: string; date: string; items: CartItem[]; delivery: Delivery; subtotal: number; shipping: number; total: number };
let orders: Order[] = [];
try {
  const raw = JSON.parse(storage?.getItem(ordersKey) ?? '[]');
  if (Array.isArray(raw)) orders = raw.filter((o: Order) => o && /^MB-[a-z0-9-]+$/i.test(o.id) && typeof o.date === 'string' && Number.isFinite(Date.parse(o.date))
    && Array.isArray(o.items) && normalizeBag(o.items).length === o.items.length && o.items.length > 0
    && ['standard', 'express'].includes(o.delivery) && [o.total, o.subtotal, o.shipping].every(n => Number.isSafeInteger(n) && n >= 0));
} catch { /* Optional browser history. */ }
let toastTimer = 0;
const navigate = (path: string) => { location.hash = `/${path}`; };
function toast(message: string) {
  const el = document.querySelector<HTMLElement>('#toast')!;
  el.textContent = message; el.classList.add('is-visible'); clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('is-visible'), 3200);
}
function badge() { document.querySelector('#cart-count')!.textContent = String(cart.items.reduce((sum, i) => sum + i.quantity, 0)); }
function heading(kicker: string, title: string, text: string) {
  return `<div class="store-heading"><p class="eyebrow">${kicker}</p><h1 tabindex="-1">${title}</h1><p>${text}</p></div>`;
}
const notice = '<p class="store-notice">Local demo store · Sample prices in PHP. No payments or real orders.</p>';
function empty(title: string, message: string) {
  return `<div class="store-empty"><span class="empty-symbol" aria-hidden="true">☕</span><h2>${title}</h2><p>${message}</p><a class="primary-button" href="#/coffee">Explore coffee ↗</a></div>`;
}
function readRoute() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  return { parts: (path || 'coffee').split('/'), params: new URLSearchParams(query) };
}
function catalogue(category: 'coffee' | 'equipment' | 'all', params: URLSearchParams) {
  const coffee = category === 'coffee';
  root.innerHTML = heading('THE MR. BEAN COLLECTION', coffee ? 'Find your <em>daily ritual.</em>' : category === 'equipment' ? 'Make room for<br><em>better mornings.</em>' : 'Your morning.<br><em>All together.</em>', coffee ? 'Bright and floral. Deep and comforting. Find the coffee that feels like you.' : 'The tools that turn good coffee into a ritual worth making time for.')
    + `<div class="collection-tabs"><a href="#/all" ${category === 'all' ? 'aria-current="page"' : ''}>Shop all</a><a href="#/coffee" ${coffee ? 'aria-current="page"' : ''}>Coffee</a><a href="#/equipment" ${category === 'equipment' ? 'aria-current="page"' : ''}>Equipment</a></div>
    <form class="catalog-controls" role="search" id="catalog-filters"><label class="search-field"><span>Find your favorite</span><input type="search" name="search" placeholder="Search coffee, tasting notes, equipment…" value="${esc(params.get('q') ?? '')}"></label><label><span>${coffee ? 'Roast' : 'Type'}</span><select name="filter"><option value="">All ${coffee ? 'roasts' : 'types'}</option>${[...new Set(catalog.filter(p => category === 'all' || p.category === category).map(p => p.roast))].map(v => `<option>${v}</option>`).join('')}</select></label><label><span>Sort by</span><select name="sort"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label></form><p class="results-count" role="status" id="results-count"></p><div class="product-grid catalog-grid" id="catalog-grid"></div>${notice}`;
  const form = root.querySelector<HTMLFormElement>('#catalog-filters')!;
  form.querySelector<HTMLSelectElement>('[name="filter"]')!.value = params.get('filter') ?? '';
  form.querySelector<HTMLSelectElement>('[name="sort"]')!.value = params.get('sort') ?? 'featured';
  function update() {
    const data = new FormData(form);
    const q = String(data.get('search') ?? ''), filter = String(data.get('filter') ?? ''), sort = String(data.get('sort') || 'featured');
    const list = filterCatalog(category, q, filter, sort);
    root.querySelector('#results-count')!.textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}${category === 'coffee' ? ' · Prices shown for 250g' : ''}`;
    root.querySelector('#catalog-grid')!.innerHTML = list.length ? list.map(p => productCard(p)).join('') : '<div class="no-results"><h2>No matches this time.</h2><p>Try a different name, tasting note or roast.</p><button class="text-link" type="button" id="reset-filters">Clear filters ↗</button></div>';
    const query = new URLSearchParams();
    if (q) query.set('q', q); if (filter) query.set('filter', filter); if (sort !== 'featured') query.set('sort', sort);
    history.replaceState(null, '', `#/${category}${query.size ? '?' + query : ''}`);
    root.querySelector('#reset-filters')?.addEventListener('click', () => {
      form.querySelector<HTMLInputElement>('[name="search"]')!.value = '';
      form.querySelector<HTMLSelectElement>('[name="filter"]')!.value = '';
      form.querySelector<HTMLSelectElement>('[name="sort"]')!.value = 'featured';
      update(); form.querySelector('input')?.focus();
    });
  }
  form.addEventListener('submit', e => { e.preventDefault(); update(); });
  form.addEventListener('input', update); form.addEventListener('change', update); update();
}
function detail(product: Product) {
  root.innerHTML = `<a class="breadcrumb" href="#/${product.category}">← Back to ${product.category}</a><div class="product-detail"><div class="detail-art product-visual">${productArt(product)}</div><div class="detail-copy"><p class="eyebrow">${product.origin}</p><h1 tabindex="-1">${product.name}</h1><p class="detail-notes">${product.notes}</p><p>${product.description}</p><form id="add-product" data-id="${product.id}">${productOptions(product)}<div class="detail-purchase"><label class="quantity-field">Quantity<input name="quantity" type="number" min="1" max="99" step="1" value="1" required></label><strong id="detail-price" aria-live="polite">${formatPrice(product.priceCents)}</strong></div><div class="purchase-actions"><button class="primary-button" type="submit" name="intent" value="bag">Add to bag <span>+</span></button><button class="secondary-button" type="submit" name="intent" value="checkout">Buy now ↗</button></div></form><p class="small-print">Demo catalog · Sample PHP pricing · No live inventory</p><div class="detail-tabs" role="tablist" aria-label="Product information"><button type="button" role="tab" id="tab-details" aria-selected="true" aria-controls="panel-details">The details</button><button type="button" role="tab" id="tab-brew" aria-selected="false" aria-controls="panel-brew" tabindex="-1">${product.category === 'coffee' ? 'How to brew' : 'Use & care'}</button></div><div role="tabpanel" id="panel-details" aria-labelledby="tab-details"><ul>${product.details.map(v => `<li>${v}</li>`).join('')}</ul></div><div role="tabpanel" id="panel-brew" aria-labelledby="tab-brew" hidden><p>${product.guide}</p></div></div></div><section class="related"><p class="eyebrow">BETTER TOGETHER</p><h2>Complete your ritual.</h2><div class="product-grid">${catalog.filter(p => p.id !== product.id && (product.category === 'coffee' ? p.category === 'equipment' : p.category === 'coffee')).slice(0, 3).map(p => productCard(p)).join('')}</div></section>`;
  const form = root.querySelector<HTMLFormElement>('#add-product')!;
  const selection = (): CartItem => {
    const data = new FormData(form);
    return { id: product.id, size: String(data.get('size')), grind: String(data.get('grind')), quantity: Number(data.get('quantity')) };
  };
  form.addEventListener('input', () => { if (form.checkValidity()) root.querySelector('#detail-price')!.textContent = formatPrice(unitPrice(selection()) * selection().quantity); });
  form.addEventListener('submit', e => {
    e.preventDefault(); if (!form.reportValidity()) return;
    cart.add(selection()); badge();
    if ((e.submitter as HTMLButtonElement)?.value === 'checkout') navigate('checkout');
    else toast(`${product.name} added to your bag.`);
  });
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  function selectTab(index: number) {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; document.getElementById(tab.getAttribute('aria-controls')!)!.hidden = i !== index; });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(i));
    tab.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - i; selectTab(next); tabs[next].focus(); } });
  });
}
function orderLines(items: CartItem[]) {
  return items.map(i => `<li><span>${findProduct(i.id)!.name}<small>${i.quantity} × ${i.size === 'Standard' ? 'Standard' : `${i.size} · ${i.grind}`}</small></span><strong>${formatPrice(unitPrice(i) * i.quantity)}</strong></li>`).join('');
}
function summary(delivery: Delivery = 'standard') {
  const t = totals(cart.items, delivery);
  return `<h2>Your summary</h2><dl class="totals"><div><dt>Subtotal</dt><dd>${formatPrice(t.subtotal)}</dd></div><div><dt>Demo delivery</dt><dd>${t.shipping ? formatPrice(t.shipping) : 'Free'}</dd></div><div class="grand-total"><dt>Estimated total</dt><dd>${formatPrice(t.total)}</dd></div></dl><p class="small-print">Demo estimate. Taxes are not calculated. Standard delivery is free from ${formatPrice(5000)}; otherwise ${formatPrice(595)}.</p>`;
}
function cartPage(focusKey?: string, focusChange?: string) {
  root.innerHTML = heading('YOUR DAILY RITUAL', 'Your shopping <em>bag.</em>', 'A few good things for the mornings ahead.') + (cart.items.length ? `<div class="cart-layout"><div class="bag-lines">${cart.items.map(i => {
    const p = findProduct(i.id)!;
    return `<article class="bag-line"><a class="mini-art" href="#/product/${p.id}" aria-label="View ${p.name}">${productArt(p)}</a><div><p class="eyebrow">${p.category}</p><h2><a href="#/product/${p.id}">${p.name}</a></h2><p>${p.category === 'coffee' ? `${i.size} · ${i.grind}` : p.roast}</p><div class="quantity"><button type="button" data-key="${esc(itemKey(i))}" data-change="-1" aria-label="Decrease ${p.name} quantity">−</button><span>${i.quantity}</span><button type="button" data-key="${esc(itemKey(i))}" data-change="1" aria-label="Increase ${p.name} quantity" ${i.quantity === 99 ? 'disabled' : ''}>+</button><button class="remove-line" type="button" data-remove="${esc(itemKey(i))}" aria-label="Remove ${p.name}">Remove</button></div></div><strong>${formatPrice(unitPrice(i) * i.quantity)}</strong></article>`;
  }).join('')}<a class="text-link" href="#/all">Continue shopping ↗</a></div><aside class="order-summary">${summary()}<a class="primary-button" href="#/checkout">Continue to checkout ↗</a>${notice}</aside></div>` : empty('Your bag is waiting.', 'Choose a coffee or a tool to begin your next ritual.'));
  root.querySelectorAll<HTMLButtonElement>('[data-change], [data-remove]').forEach(b => b.addEventListener('click', () => {
    const key = b.dataset.key ?? b.dataset.remove!;
    if (b.dataset.change) cart.change(key, Number(b.dataset.change)); else cart.remove(key);
    badge(); cartPage(key, b.dataset.change);
  }));
  if (focusKey) {
    const target = [...root.querySelectorAll<HTMLButtonElement>('[data-key]')].find(b => b.dataset.key === focusKey && b.dataset.change === focusChange);
    (target ?? root.querySelector<HTMLElement>('h1'))?.focus();
  }
}
function checkout() {
  if (!cart.items.length) { root.innerHTML = heading('CHECKOUT', 'Something good<br><em>starts here.</em>', '') + empty('Your bag is empty.', 'Add a product before trying the demo checkout.'); return; }
  root.innerHTML = `<a class="breadcrumb" href="#/cart">← Back to your bag</a>${heading('THE LAST STEP', 'Make it your <em>morning.</em>', 'Demo checkout — no payment, shipment or real order will be created.')}<div class="checkout-layout"><form id="checkout-form" class="checkout-form"><fieldset><legend>01 / Contact</legend><label>Email<input type="email" name="email" autocomplete="email" required maxlength="160" placeholder="you@example.com"></label></fieldset><fieldset><legend>02 / Delivery details</legend><div class="form-pair"><label>First name<input name="firstName" autocomplete="given-name" required maxlength="70"></label><label>Last name<input name="lastName" autocomplete="family-name" required maxlength="70"></label></div><label>Street address<input name="address" autocomplete="street-address" required maxlength="200"></label><label>Apartment, suite, etc. <span>(optional)</span><input name="address2" autocomplete="address-line2" maxlength="100"></label><div class="form-pair"><label>City<input name="city" autocomplete="address-level2" required maxlength="90"></label><label>Postal code<input name="postal" autocomplete="postal-code" required maxlength="24"></label></div><label>Country / region<input name="country" autocomplete="country-name" required maxlength="90"></label><p class="small-print">Use sample details. This information stays in this form and is not saved or sent.</p></fieldset><fieldset><legend>03 / Delivery option</legend><label class="delivery-option"><input type="radio" name="delivery" value="standard" checked><span>Standard <small>Demo option · 3–5 business days</small></span><strong>${totals(cart.items).shipping ? formatPrice(totals(cart.items).shipping) : 'Free'}</strong></label><label class="delivery-option"><input type="radio" name="delivery" value="express"><span>Express <small>Demo option · 1–2 business days</small></span><strong>${formatPrice(1295)}</strong></label></fieldset><fieldset><legend>04 / Demo payment</legend><div class="payment-placeholder">No card details required.<p>This checkout demonstrates the shopping flow. No money will be charged.</p></div></fieldset><button type="submit" class="primary-button">Create demo order ↗</button></form><aside class="order-summary"><ul class="summary-lines">${orderLines(cart.items)}</ul><div id="checkout-totals">${summary()}</div></aside></div>`;
  const form = root.querySelector<HTMLFormElement>('#checkout-form')!;
  form.addEventListener('change', () => { root.querySelector('#checkout-totals')!.innerHTML = summary(new FormData(form).get('delivery') === 'express' ? 'express' : 'standard'); });
  form.addEventListener('submit', e => {
    e.preventDefault(); if (!form.reportValidity() || !cart.items.length) return;
    const delivery: Delivery = new FormData(form).get('delivery') === 'express' ? 'express' : 'standard';
    const order: Order = { id: `MB-${crypto.randomUUID()}`, date: new Date().toISOString(), items: cart.items, delivery, ...totals(cart.items, delivery) };
    orders.unshift(order); orders = orders.slice(0, 30);
    try { storage?.setItem(ordersKey, JSON.stringify(orders)); } catch { toast('Order available for this session; browser storage is unavailable.'); }
    cart.clear(); badge(); form.reset(); navigate(`order/${order.id}`);
  });
}
function orderPage(id: string) {
  const order = orders.find(o => o.id === id);
  if (!order) { root.innerHTML = empty('Order not found.', 'This demo order may belong to another browser or a cleared session.'); return; }
  root.innerHTML = heading('DEMO ORDER COMPLETE', 'Your ritual,<br><em>all lined up.</em>', 'This is a local demo confirmation. No real order was placed and nothing was charged.') + `<section class="confirmation"><p class="eyebrow">${esc(order.id)}</p><p>${new Date(order.date).toLocaleString()} · ${order.delivery === 'express' ? 'Express' : 'Standard'} demo delivery</p><ul class="summary-lines">${orderLines(order.items)}</ul><dl class="totals"><div><dt>Subtotal</dt><dd>${formatPrice(order.subtotal)}</dd></div><div><dt>Demo delivery</dt><dd>${formatPrice(order.shipping)}</dd></div><div class="grand-total"><dt>Demo total</dt><dd>${formatPrice(order.total)}</dd></div></dl><div class="purchase-actions"><a class="primary-button" href="#/coffee">Keep exploring ↗</a><a class="secondary-button" href="#/orders">View demo orders</a></div></section>`;
}
function orderHistory() {
  root.innerHTML = heading('SAVED IN THIS BROWSER', 'Your demo <em>orders.</em>', 'A record of your practice checkouts. No payments or real orders.') + (orders.length ? `<div class="order-history">${orders.map(o => `<a class="history-row" href="#/order/${esc(o.id)}"><span><strong>${esc(o.id.slice(0, 11).toUpperCase())}</strong><small>${new Date(o.date).toLocaleDateString()} · ${o.items.reduce((n, i) => n + i.quantity, 0)} items</small></span><span>${formatPrice(o.total)} <span aria-hidden="true">↗</span></span></a>`).join('')}</div>` : empty('No demo orders yet.', 'Browse the collection and try the checkout when you’re ready.'));
}
function guide() {
  root.innerHTML = heading('A LITTLE CARE. A BETTER CUP.', 'Find your<br><em>brewing ritual.</em>', 'Start with a simple recipe, then make it your own.') + `<div class="guide-grid">${[
    ['01', 'Pour-over', '15g coffee · 250g water', 'Choose a medium grind. Wet the grounds with a little water, pause, then pour slowly in circles. Adjust the ratio to taste.'],
    ['02', 'Espresso', '18g coffee · 36g yield', 'Start with a fine grind and a level tamp. Keep your dose consistent and adjust the grind gradually until the cup tastes balanced.'],
    ['03', 'French press', '30g coffee · 500g water', 'Use a coarse grind. Add water, stir gently and steep for around four minutes before pressing slowly. Decant into your cup.'],
  ].map(([n, title, ratio, copy]) => `<article class="guide-card"><span class="guide-number">${n}</span><h2>${title}</h2><p class="eyebrow">${ratio}</p><p>${copy}</p><a class="text-link" href="#/coffee">Find your coffee ↗</a></article>`).join('')}</div><div class="guide-banner"><h2>The tools behind the ritual.</h2><a class="primary-button" href="#/equipment">Browse equipment ↗</a></div>`;
}
function render() {
  if (location.hash === '#store-content') { root.focus(); return; }
  const { parts, params } = readRoute(); const [page, id] = parts;
  badge();
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach(link => {
    const category = page === 'product' ? findProduct(id)?.category : page === 'order' ? 'orders' : page;
    if (link.dataset.nav === category) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  if (page === 'coffee' || page === 'equipment' || page === 'all') catalogue(page, params);
  else if (page === 'product' && findProduct(id)) detail(findProduct(id)!);
  else if (page === 'cart') cartPage();
  else if (page === 'checkout') checkout();
  else if (page === 'orders') orderHistory();
  else if (page === 'order') orderPage(id);
  else if (page === 'guide') guide();
  else root.innerHTML = heading('A DIFFERENT PATH', 'Page not found.', '') + empty('Let’s find your coffee.', 'The link may have changed. The collection is right here.');
  document.title = `${root.querySelector('h1')?.textContent ?? 'Shop'} — Mr. Bean`;
  window.scrollTo({ top: 0, behavior: 'instant' }); root.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
}
window.addEventListener('hashchange', render);
document.querySelector('.skip-link')?.addEventListener('click', e => { e.preventDefault(); root.focus(); });
window.addEventListener('pageshow', e => { if (e.persisted) { cart.reload(); render(); } });
window.addEventListener('storage', e => {
  if (e.key !== BAG_KEY && e.key !== null) return;
  cart.reload(); badge();
  if (readRoute().parts[0] === 'checkout') { toast('Your bag changed in another tab. Please review it.'); navigate('cart'); }
  else if (readRoute().parts[0] === 'cart') cartPage();
});
render();
