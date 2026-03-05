export const destinationCurrency: Record<string, { code: string; symbol: string }> = {
  // India
  india: { code: 'INR', symbol: '₹' }, goa: { code: 'INR', symbol: '₹' }, delhi: { code: 'INR', symbol: '₹' },
  mumbai: { code: 'INR', symbol: '₹' }, jaipur: { code: 'INR', symbol: '₹' }, manali: { code: 'INR', symbol: '₹' },
  kerala: { code: 'INR', symbol: '₹' }, varanasi: { code: 'INR', symbol: '₹' }, agra: { code: 'INR', symbol: '₹' },
  // Europe
  paris: { code: 'EUR', symbol: '€' }, france: { code: 'EUR', symbol: '€' },
  rome: { code: 'EUR', symbol: '€' }, italy: { code: 'EUR', symbol: '€' },
  barcelona: { code: 'EUR', symbol: '€' }, spain: { code: 'EUR', symbol: '€' },
  amsterdam: { code: 'EUR', symbol: '€' }, berlin: { code: 'EUR', symbol: '€' }, germany: { code: 'EUR', symbol: '€' },
  london: { code: 'GBP', symbol: '£' }, uk: { code: 'GBP', symbol: '£' }, england: { code: 'GBP', symbol: '£' },
  switzerland: { code: 'CHF', symbol: 'CHF' }, zurich: { code: 'CHF', symbol: 'CHF' },
  // Asia
  tokyo: { code: 'JPY', symbol: '¥' }, japan: { code: 'JPY', symbol: '¥' }, osaka: { code: 'JPY', symbol: '¥' }, kyoto: { code: 'JPY', symbol: '¥' },
  bangkok: { code: 'THB', symbol: '฿' }, thailand: { code: 'THB', symbol: '฿' },
  singapore: { code: 'SGD', symbol: 'S$' },
  bali: { code: 'IDR', symbol: 'Rp' }, indonesia: { code: 'IDR', symbol: 'Rp' },
  beijing: { code: 'CNY', symbol: '¥' }, shanghai: { code: 'CNY', symbol: '¥' }, china: { code: 'CNY', symbol: '¥' },
  seoul: { code: 'KRW', symbol: '₩' }, korea: { code: 'KRW', symbol: '₩' },
  // Middle East
  dubai: { code: 'AED', symbol: 'AED' }, uae: { code: 'AED', symbol: 'AED' },
  // Americas
  'new york': { code: 'USD', symbol: '$' }, nyc: { code: 'USD', symbol: '$' }, usa: { code: 'USD', symbol: '$' },
  'los angeles': { code: 'USD', symbol: '$' }, 'san francisco': { code: 'USD', symbol: '$' },
  'rio de janeiro': { code: 'BRL', symbol: 'R$' }, brazil: { code: 'BRL', symbol: 'R$' },
  toronto: { code: 'CAD', symbol: 'C$' }, canada: { code: 'CAD', symbol: 'C$' },
  'mexico city': { code: 'MXN', symbol: 'MX$' }, mexico: { code: 'MXN', symbol: 'MX$' },
  // Oceania
  sydney: { code: 'AUD', symbol: 'A$' }, australia: { code: 'AUD', symbol: 'A$' },
  // Africa
  cairo: { code: 'EGP', symbol: 'E£' }, egypt: { code: 'EGP', symbol: 'E£' },
  capetown: { code: 'ZAR', symbol: 'R' }, 'south africa': { code: 'ZAR', symbol: 'R' },
  // Turkey
  istanbul: { code: 'TRY', symbol: '₺' }, turkey: { code: 'TRY', symbol: '₺' },
  // Maldives
  maldives: { code: 'USD', symbol: '$' },
};

export function getCurrencyForDestination(destination: string): { code: string; symbol: string } {
  const lower = destination.toLowerCase().trim();
  for (const [key, val] of Object.entries(destinationCurrency)) {
    if (lower.includes(key)) return val;
  }
  return { code: 'USD', symbol: '$' };
}
