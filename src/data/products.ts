import { formatPrice } from './currency';
// Base USD prices; customer-facing amounts use the shared PHP conversion.
export const products = [
  { id: 'dawn', name: 'Signature Dawn Blend', short: 'Dawn<br>Blend', origin: 'The house collection', roast: 'Medium-dark roast', notes: 'Milk chocolate · Hazelnut · Candied orange', price: 18.50, color: '#300916' },
  { id: 'ethiopia', name: 'Ethiopia Yirgacheffe', short: 'Ethiopia', origin: 'Yirgacheffe, Ethiopia', roast: 'Light roast', notes: 'Jasmine · Bergamot · White peach', price: 21, color: '#7d7961' },
  { id: 'guatemala', name: 'Guatemala Antigua', short: 'Guatemala', origin: 'Antigua Valley', roast: 'Medium roast', notes: 'Dark chocolate · Toasted pecan · Honey', price: 19.50, color: '#a06b4d' },
  { id: 'sumatra', name: 'Sumatra Mandheling', short: 'Sumatra', origin: 'Lake Toba, Sumatra', roast: 'Dark roast', notes: 'Cedar · Smoky caramel · Molasses', price: 20, color: '#3b4844' },
] as const;
export const sizes = [{ value: '250g', multiplier: 1 }, { value: '500g', multiplier: 1.85 }, { value: '1kg', multiplier: 3.5 }];
export const grinds = ['Whole bean', 'Espresso', 'Pour-over', 'French press'];
export const money = (value: number) => formatPrice(Math.round(value * 100));
