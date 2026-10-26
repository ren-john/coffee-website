import { type Product, formatPrice, sizes, grinds } from '../data/catalog';
export const escapeHTML = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export function productArt(p: Product) {
  return p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy" width="600" height="600">`
    : `<div class="coffee-pouch" role="img" aria-label="${p.name} package" style="--roast:${p.color}"><span class="pouch-fold"></span><span class="pouch-brand brand-mark"><img src="/images/mr-bean-logo.jpeg" alt="Mr. Bean Coffee Company" width="1149" height="912"></span><span class="pouch-label"><small>THE COFFEE COLLECTION</small>${p.short}<small>YOUR DAILY RITUAL</small></span></div>`;
}
export function productCard(p: Product, prefix = '#') {
  return `<article class="product-card"><a class="product-visual" href="${prefix}/product/${p.id}" aria-label="View ${p.name}"><span class="roast-tag">${p.roast}</span>${productArt(p)}</a><div class="product-meta"><span>${p.origin}</span></div><h3><a href="${prefix}/product/${p.id}">${p.name}</a></h3><p class="tasting-notes">${p.notes}</p><div class="product-purchase"><span class="product-price">${p.category === 'coffee' ? '<small>From </small>' : ''}${formatPrice(p.priceCents)}</span><a class="add-to-bag" href="${prefix}/product/${p.id}">Explore <span aria-hidden="true">↗</span></a></div></article>`;
}
export function productOptions(p: Product) {
  return p.category === 'coffee' ? `<div class="product-options"><label><span>Bag size</span><select name="size">${sizes.map(s => `<option>${s.value}</option>`).join('')}</select></label><label><span>Your grind</span><select name="grind">${grinds.map(g => `<option>${g}</option>`).join('')}</select></label></div>` : '<input name="size" type="hidden" value="Standard"><input name="grind" type="hidden" value="Not applicable">';
}
