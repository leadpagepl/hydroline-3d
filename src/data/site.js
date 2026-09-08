/**
 * Business data.
 *
 * Verified company data supplied for this site. Contact channels stay empty
 * until a real phone number or e-mail address is provided.
 */
export const site = {
  name: 'Jacek Czuber — Zakład Hydrauliczny',
  wordmark: ['JACEK', 'CZUBER'],
  descriptor: 'Zakład Hydrauliczny',
  address: ['ul. Stefana Jaracza 76', '90-251 Łódź'],
  nip: '5571294322',
  regon: '471474084',
  contact: {
    phone: '508 324 246',
    email: '',
    area: '',
    hours: '',
  },
}

/** Where an action points. Uses a real channel as soon as one exists. */
export function ctaHref(kind = 'quote') {
  const { phone } = site.contact
  if (kind === 'call') return phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : null
  return '#kontakt'
}
