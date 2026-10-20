import { products, sizes, grinds, money } from '../data/products';
type Item = { id: string; size: string; grind: string; quantity: number };
const key = 'mr-bean-local-bag-v1';
export function setupShop() {
  let bag: Item[] = [];
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (Array.isArray(stored)) bag = stored.filter((v: Item) => products.some(p => p.id === v?.id) && sizes.some(s => s.value === v.size) && grinds.includes(v.grind) && Number.isInteger(v.quantity) && v.quantity > 0 && v.quantity <= 99);
  } catch { /* Storage is optional; the bag still works in memory. */ }
  const grid = document.querySelector<HTMLElement>('#product-grid')!;
  const dialog = document.querySelector<HTMLDialogElement>('#cart-dialog')!;
  const toast = document.querySelector<HTMLElement>('#toast')!;
  let toastTimer = 0;
  const unitPrice = (item: Item) => products.find(p => p.id === item.id)!.price * sizes.find(s => s.value === item.size)!.multiplier;
  function renderBag() {
    const items = document.querySelector<HTMLElement>('#cart-items')!;
    items.innerHTML = bag.length ? bag.map((item, i) => `<div class="cart-item"><div><h3>${products.find(p => p.id === item.id)!.name}</h3><p>${item.size} / ${item.grind}</p><div class="quantity"><button data-quantity="${i}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-quantity="${i}" data-change="1" aria-label="Increase quantity" ${item.quantity >= 99 ? 'disabled' : ''}>+</button></div></div><div><div class="cart-item-price">${money(unitPrice(item) * item.quantity)}</div><button class="remove-item" data-remove="${i}">Remove</button></div></div>`).join('') : '<p class="empty-cart">A little room for something good.</p>';
    document.querySelector('#cart-count')!.textContent = String(bag.reduce((sum, i) => sum + i.quantity, 0));
    document.querySelector('#cart-total')!.textContent = money(bag.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0));
    try { localStorage.setItem(key, JSON.stringify(bag)); } catch { /* Private/storage-restricted mode. */ }
  }
  grid.innerHTML = products.map(product => `<article class="product-card" data-product="${product.id}"><div class="product-visual"><span class="roast-tag">${product.roast}</span><div class="coffee-pouch" role="img" aria-label="Mr. Bean ${product.name} packaging" style="--roast:${product.color}"><span class="pouch-fold"></span><span class="pouch-brand">Mr. Bean</span><span class="pouch-label"><small>THE COFFEE COLLECTION</small>${product.short}<small>WHOLE BEAN / 250 g</small></span></div></div><div class="product-meta"><span>${product.origin}</span><span>01 — 04</span></div><h3>${product.name}</h3><p class="tasting-notes">${product.notes}</p><div class="product-options"><label><span>Bag size</span><select class="size-select" aria-label="Bag size for ${product.name}">${sizes.map(s => `<option>${s.value}</option>`).join('')}</select></label><label><span>Your grind</span><select class="grind-select" aria-label="Grind for ${product.name}">${grinds.map(g => `<option>${g}</option>`).join('')}</select></label></div><div class="product-purchase"><span class="product-price">${money(product.price)}</span><button class="add-to-bag" aria-label="Add ${product.name} to bag">Add to bag <span aria-hidden="true">+</span></button></div></article>`).join('');
  grid.querySelectorAll<HTMLElement>('.product-card').forEach((card, index) => {
    const product = products[index];
    card.querySelector('.product-meta > span:last-child')!.textContent = `0${index + 1} — 04`;
    const size = card.querySelector<HTMLSelectElement>('.size-select')!;
    const grind = card.querySelector<HTMLSelectElement>('.grind-select')!;
    size.addEventListener('change', () => { card.querySelector('.product-price')!.textContent = money(product.price * sizes.find(s => s.value === size.value)!.multiplier); });
    card.querySelector('.add-to-bag')!.addEventListener('click', () => {
      const existing = bag.find(v => v.id === product.id && v.size === size.value && v.grind === grind.value);
      if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
      else bag.push({ id: product.id, size: size.value, grind: grind.value, quantity: 1 });
      renderBag(); toast.textContent = `${product.name} added to your bag.`; toast.classList.add('is-visible'); window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
    });
  });
  document.querySelector('#open-cart')!.addEventListener('click', () => { renderBag(); dialog.showModal(); });
  dialog.querySelectorAll('.close-cart').forEach(b => b.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', e => {
    if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); }
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button.dataset.remove !== undefined) { bag.splice(Number(button.dataset.remove), 1); renderBag(); }
    if (button.dataset.quantity !== undefined) {
      const i = Number(button.dataset.quantity); const item = bag[i];
      item.quantity = Math.min(99, item.quantity + Number(button.dataset.change));
      if (item.quantity <= 0) bag.splice(i, 1);
      renderBag();
      (dialog.querySelector(`button[data-quantity="${Math.min(i, bag.length - 1)}"][data-change="${button.dataset.change}"]`) as HTMLElement | null)?.focus();
    }
  });
  renderBag();
}
