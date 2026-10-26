// Fixed demo conversion, not a live exchange rate. Existing catalog, cart and
// saved order amounts remain in base USD cents so older orders stay consistent.
export const PHP_PER_USD = 60;
export const toPesoCentavos = (baseCents: number) => Math.round(baseCents * PHP_PER_USD);
const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
export const formatPrice = (baseCents: number) => peso.format(toPesoCentavos(baseCents) / 100);
