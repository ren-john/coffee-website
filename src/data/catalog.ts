import { products, sizes, grinds } from './products';

export type Product = {
  id: string; name: string; category: 'coffee' | 'equipment'; priceCents: number;
  short: string; origin: string; roast: string; notes: string; color: string;
  image?: string; description: string; details: string[]; guide: string;
};
export const catalog: Product[] = [
  ...products.map(p => ({ ...p, category: 'coffee' as const, priceCents: Math.round(p.price * 100),
    description: `${p.name} brings ${p.notes.toLowerCase()} to your daily ritual. Choose your bag size and the grind that suits how you brew.`,
    details: ['Choose whole bean or ground to order in this demo catalog.', 'Available in 250g, 500g and 1kg bags.', 'Keep sealed in a cool, dry place.'],
    guide: 'For a pour-over, start with 15g coffee to 250g water. For espresso, start with 18g coffee and a 36g yield. Adjust the grind and ratio to taste.',
  })),
  { id: 'grinder', name: 'The Daily Grinder', short: 'Daily Grinder', category: 'equipment', priceCents: 24900, origin: 'Freshly ground, every morning', roast: 'Grinders', notes: 'Adjustable grind · Bean hopper · Portafilter cradle', color: '#300916', image: '/images/grinder.png', description: 'Bring the grinding step of your morning ritual to your countertop. A hopper-fed grinder with an adjustable dial and a portafilter cradle.', details: ['Concept product based on the custom 3D model.', 'Includes the grinder and hopper shown.', 'Final specifications and availability are not yet set.'], guide: 'Start with a small dose, adjust the grind one step at a time, and compare your next brew. Unplug before cleaning; keep the motor housing dry.' },
  { id: 'espresso', name: 'The Home Espresso', short: 'Home Espresso', category: 'equipment', priceCents: 49900, origin: 'Make the moment yours', roast: 'Espresso machines', notes: 'Manual lever · Walnut accents · Countertop ritual', color: '#300916', image: '/images/espresso.png', description: 'A manual espresso concept for a more considered morning. Dark metal and warm wood carry the same character as the machine in our bean-to-cup story.', details: ['Concept product based on the custom 3D model.', 'Includes the machine and portafilter shown.', 'Final specifications and availability are not yet set.'], guide: 'Use a consistent dose and a level tamp, then adjust your grind to control extraction. Follow the final manufacturer instructions before using any real machine.' },
  { id: 'cup', name: 'The Everyday Cup', short: 'Everyday Cup', category: 'equipment', priceCents: 2400, origin: 'A little pause, made yours', roast: 'Cups & accessories', notes: 'Ceramic cup · Matching saucer · Everyday comfort', color: '#300916', image: '/images/cup.png', description: 'The finishing touch to your daily ritual: a ceramic cup and matching saucer inspired by the final scene of our story.', details: ['One cup and matching saucer.', 'Coffee shown for presentation only.', 'Concept product; final dimensions are not yet set.'], guide: 'Warm the cup with hot water before brewing, then empty it and pour your coffee. Hand-wash gently and dry before storing.' },
];
export { sizes, grinds };
export const findProduct = (id: string) => catalog.find(p => p.id === id);
export { formatPrice } from './currency';

export function filterCatalog(category: string, query = '', roast = '', sort = 'featured') {
  const words = query.trim().toLowerCase();
  const list = catalog.filter(p => (category === 'all' || p.category === category)
    && (!roast || p.roast === roast)
    && `${p.name} ${p.origin} ${p.notes} ${p.roast}`.toLowerCase().includes(words));
  if (sort === 'price-low') list.sort((a, b) => a.priceCents - b.priceCents);
  if (sort === 'price-high') list.sort((a, b) => b.priceCents - a.priceCents);
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}
