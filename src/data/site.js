/**
 * Business data.
 *
 * Intentionally empty: no phone number, address, years in business, review
 * count or certification is invented anywhere on this site. Fill these in and
 * the header, footer and calls to action pick them up automatically; leave them
 * blank and the UI simply omits those elements.
 */
export const site = {
  name: 'HYDROLINE',
  wordmark: ['HYDRO', 'LINE'],
  contact: {
    phone: '',
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
