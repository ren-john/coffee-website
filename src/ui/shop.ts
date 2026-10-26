import { catalog, findProduct, formatPrice } from '../data/catalog';
import { createCart, browserStorage, itemKey, totals, unitPrice, BAG_KEY } from '../data/cart';
import { productCard, escapeHTML } from './productViews';

export function setupShop() {
  const cart = createCart(browserStorage());
  const dialog = document.querySelector<HTMLDialogElement>('#cart-dialog')!;
  document.querySelector('#product-grid')!.innerHTML = catalog.filter(p => p.category === 'coffee').map(p => productCard(p, 'shop.html#')).join('');
  function renderBag() {
    document.querySelector('#cart-count')!.textContent = String(cart.items.reduce((sum, i) => sum + i.quantity, 0));
    document.querySelector('#cart-items')!.innerHTML = cart.items.length ? cart.items.map(item => {
      const p = findProduct(item.id)!;
      return `<div class="cart-item"><div><h3><a href="shop.html#/product/${p.id}">${p.name}</a></h3><p>${p.category === 'coffee' ? `${item.size} / ${item.grind}` : p.roast}</p><div class="quantity"><button data-key="${escapeHTML(itemKey(item))}" data-change="-1" aria-label="Decrease ${p.name} quantity">−</button><span>${item.quantity}</span><button data-key="${escapeHTML(itemKey(item))}" data-change="1" aria-label="Increase ${p.name} quantity" ${item.quantity === 99 ? 'disabled' : ''}>+</button></div></div><div><div class="cart-item-price">${formatPrice(unitPrice(item) * item.quantity)}</div><button class="remove-item" data-remove="${escapeHTML(itemKey(item))}">Remove</button></div></div>`;
    }).join('') : '<p class="empty-cart">Your next favorite brew is waiting.</p><a class="text-link" href="shop.html#/coffee">Browse coffee ↗</a>';
    document.querySelector('#cart-total')!.textContent = formatPrice(totals(cart.items).subtotal);
    document.querySelector<HTMLElement>('#cart-checkout')!.hidden = !cart.items.length;
  }
  document.querySelector('#open-cart')!.addEventListener('click', () => { cart.reload(); renderBag(); dialog.showModal(); });
  dialog.querySelectorAll('.close-cart').forEach(b => b.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', e => {
    if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); }
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!button) return;
    const key = button.dataset.key ?? button.dataset.remove;
    if (!key) return;
    const change = button.dataset.change;
    if (change) cart.change(key, Number(change)); else cart.remove(key);
    renderBag();
    const next = [...dialog.querySelectorAll<HTMLButtonElement>('button[data-key]')].find(b => b.dataset.key === key && b.dataset.change === change);
    (next ?? dialog.querySelector<HTMLButtonElement>('.close-cart'))?.focus();
  });
  window.addEventListener('storage', e => { if (e.key === BAG_KEY || e.key === null) { cart.reload(); renderBag(); } });
  window.addEventListener('pageshow', e => { if (e.persisted) { cart.reload(); renderBag(); } });
  renderBag();
}
