import { findProduct, sizes, grinds } from './catalog';
export type CartItem = { id: string; size: string; grind: string; quantity: number };
export type Delivery = 'standard' | 'express';
export const BAG_KEY = 'mr-bean-local-bag-v1';
export function validItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as CartItem, product = findProduct(v.id);
  return !!product && Number.isInteger(v.quantity) && v.quantity > 0 && v.quantity <= 99
    && (product.category === 'coffee'
      ? sizes.some(s => s.value === v.size) && grinds.includes(v.grind)
      : v.size === 'Standard' && v.grind === 'Not applicable');
}
export function normalizeBag(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  for (const item of value.filter(validItem)) {
    const existing = result.find(v => itemKey(v) === itemKey(item));
    if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity);
    else result.push({ id: item.id, size: item.size, grind: item.grind, quantity: item.quantity });
  }
  return result;
}
export const itemKey = (item: Pick<CartItem, 'id' | 'size' | 'grind'>) => `${item.id}|${item.size}|${item.grind}`;
export function unitPrice(item: CartItem) {
  const product = findProduct(item.id);
  if (!product || !validItem(item)) throw new Error('Invalid cart item');
  const multiplier = product.category === 'coffee' ? sizes.find(s => s.value === item.size)!.multiplier : 1;
  return Math.round(product.priceCents * multiplier);
}
export function totals(items: CartItem[], delivery: Delivery = 'standard') {
  const subtotal = items.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  const shipping = !items.length ? 0 : delivery === 'express' ? 1295 : subtotal >= 5000 ? 0 : 595;
  return { subtotal, shipping, total: subtotal + shipping };
}
export function createCart(storage?: Pick<Storage, 'getItem' | 'setItem'>) {
  let items: CartItem[] = [];
  function reload() {
    if (!storage) return;
    let saved: string | null;
    try { saved = storage.getItem(BAG_KEY); } catch { return; }
    try { items = normalizeBag(JSON.parse(saved ?? '[]')); } catch { items = []; }
  }
  reload();
  function save() { try { storage?.setItem(BAG_KEY, JSON.stringify(items)); } catch { /* Keep the current session usable. */ } }
  return {
    get items() { return items.map(i => ({ ...i })); },
    reload,
    add(item: CartItem) {
      if (!validItem(item)) throw new Error('Please choose valid product options.');
      items = normalizeBag([...items, item]); save();
    },
    change(key: string, delta: number) {
      const item = items.find(i => itemKey(i) === key);
      if (!item || !Number.isInteger(delta)) return;
      item.quantity = Math.min(99, item.quantity + delta);
      items = items.filter(i => i.quantity > 0); save();
    },
    remove(key: string) { items = items.filter(i => itemKey(i) !== key); save(); },
    clear() { items = []; save(); },
  };
}
export function browserStorage() { try { return window.localStorage; } catch { return undefined; } }
