import { describe, expect, it } from 'vitest';
import { BAG_KEY, createCart, itemKey, normalizeBag, totals, unitPrice, type CartItem } from '../src/data/cart';
import { catalog, filterCatalog } from '../src/data/catalog';
import { formatPrice, toPesoCentavos } from '../src/data/currency';

const coffee: CartItem = { id: 'dawn', size: '250g', grind: 'Whole bean', quantity: 1 };
describe('Philippine peso storefront', () => {
  it('converts base prices, delivery and thresholds to pesos consistently', () => {
    expect(formatPrice(1850)).toBe('₱1,110.00');
    expect(formatPrice(24900)).toBe('₱14,940.00');
    expect(formatPrice(595)).toBe('₱357.00');
    expect(formatPrice(1295)).toBe('₱777.00');
    expect(formatPrice(5000)).toBe('₱3,000.00');
    expect(formatPrice(0)).toBe('₱0.00');
  });
  it('keeps saved base totals and converted line prices consistent', () => {
    const items = [coffee, { ...coffee, size: '500g', quantity: 2 }];
    const receipt = totals(items);
    const lines = items.reduce((sum, item) => sum + toPesoCentavos(unitPrice(item)) * item.quantity, 0);
    expect(lines + toPesoCentavos(receipt.shipping)).toBe(toPesoCentavos(receipt.total));
    expect(formatPrice(2445)).toBe('₱1,467.00');
  });
});
function memoryStorage(initial: string | null = null) {
  const data = new Map<string, string>(initial === null ? [] : [[BAG_KEY, initial]]);
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}
describe('shopping bag', () => {
  it('merges matching variants while retaining different sizes and grinds', () => {
    const cart = createCart();
    cart.add(coffee); cart.add({ ...coffee, quantity: 2 });
    cart.add({ ...coffee, size: '500g' }); cart.add({ ...coffee, grind: 'Espresso' });
    expect(cart.items).toHaveLength(3);
    expect(cart.items[0].quantity).toBe(3);
    expect(totals(cart.items).subtotal).toBe(10823);
  });
  it('rounds each unit to cents before multiplying quantity', () => {
    const large = { ...coffee, size: '500g', quantity: 3 };
    expect(unitPrice(large)).toBe(3423);
    expect(totals([large]).subtotal).toBe(10269);
  });
  it('rejects unknown products, invalid options, and non-integer or excessive quantities', () => {
    const values = [null, {}, { ...coffee, id: 'missing' }, { ...coffee, size: '10kg' }, { ...coffee, grind: '<script>' },
      ...[0, -1, 1.5, 100, '2', Infinity].map(quantity => ({ ...coffee, quantity }))];
    expect(normalizeBag(values)).toEqual([]);
    expect(() => createCart().add({ ...coffee, quantity: -1 })).toThrow();
  });
  it('caps combined quantities and removes a line when its quantity reaches zero', () => {
    const cart = createCart(); cart.add({ ...coffee, quantity: 99 }); cart.add(coffee);
    expect(cart.items[0].quantity).toBe(99);
    cart.change(itemKey(coffee), 1); expect(cart.items[0].quantity).toBe(99);
    cart.change(itemKey(coffee), -99); expect(cart.items).toEqual([]);
  });
  it('restores a saved bag across page instances and supports removal and clearing', () => {
    const storage = memoryStorage(), first = createCart(storage);
    first.add(coffee);
    const next = createCart(storage); expect(next.items).toEqual([coffee]);
    next.remove(itemKey(coffee)); first.reload(); expect(first.items).toEqual([]);
    next.add(coffee); next.clear(); expect(createCart(storage).items).toEqual([]);
  });
  it('keeps the current session usable when storage is absent or denied', () => {
    for (const storage of [undefined, { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } }]) {
      const cart = createCart(storage); cart.add(coffee); cart.reload(); expect(cart.items).toEqual([coffee]);
    }
  });
  it('recovers corrupt saved data and copies items to prevent external mutation', () => {
    expect(createCart(memoryStorage('{bad json')).items).toEqual([]);
    const cart = createCart(memoryStorage(JSON.stringify([coffee, { ...coffee, id: 'missing' }])));
    const copy = cart.items; copy[0].quantity = 50;
    expect(cart.items).toEqual([coffee]);
  });
  it('charges delivery only for a nonempty bag, with a $50 standard threshold', () => {
    expect(totals([])).toEqual({ subtotal: 0, shipping: 0, total: 0 });
    expect(totals([], 'express').shipping).toBe(0);
    expect(totals([coffee])).toEqual({ subtotal: 1850, shipping: 595, total: 2445 });
    expect(totals([{ ...coffee, quantity: 3 }]).shipping).toBe(0);
    expect(totals([{ ...coffee, quantity: 3 }], 'express').shipping).toBe(1295);
  });
  it('uses equipment prices without coffee multipliers or grind options', () => {
    const gear = { id: 'grinder', size: 'Standard', grind: 'Not applicable', quantity: 1 };
    expect(unitPrice(gear)).toBe(24900);
    expect(normalizeBag([{ ...gear, size: '500g' }])).toEqual([]);
    expect(totals([coffee, gear]).total).toBe(26750);
  });
});
describe('catalog browsing', () => {
  it('combines category, case-insensitive tasting-note search and roast filters', () => {
    expect(filterCatalog('coffee', ' JASMINE ', 'Light roast').map(p => p.id)).toEqual(['ethiopia']);
    expect(filterCatalog('equipment', 'jasmine')).toEqual([]);
    expect(filterCatalog('coffee', 'jasmine', 'Dark roast')).toEqual([]);
    expect(filterCatalog('all', 'walnut').map(p => p.id)).toEqual(['espresso']);
  });
  it('sorts by price without mutating the featured order', () => {
    const ids = catalog.map(p => p.id);
    const low = filterCatalog('all', '', '', 'price-low');
    expect(low[0].id).toBe('dawn'); expect(low.at(-1)?.id).toBe('espresso');
    expect(filterCatalog('all', '', '', 'price-high')[0].id).toBe('espresso');
    expect(catalog.map(p => p.id)).toEqual(ids);
  });
});
