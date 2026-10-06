/**
 * Business data.
 *
 * Verified company data supplied for this site. Contact channels stay empty
 * until a real value is provided.
 */
export const site = {
  name: 'Jacek Czuber — Firma instalacji sanitarnych',
  wordmark: ['JACEK', 'CZUBER'],
  descriptor: 'Firma instalacji sanitarnych',
  address: ['ul. Stefana Jaracza 76', '90-251 Łódź'],
  nip: '5571294322',
  regon: '471474084',
  contact: {
    phone: '602 128 935',
    email: '',
    area: '',
    hours: '',
  },
}

/** tel: link for the company phone, or null while no number is set. */
export function phoneHref() {
  const digits = site.contact.phone.replace(/\D/g, '')
  return digits ? `tel:+48${digits}` : null
}

/** Where an action points. Calls use the phone as soon as one exists. */
export function ctaHref(kind = 'quote') {
  if (kind === 'call') return phoneHref() ?? '#kontakt'
  return '#kontakt'
}
