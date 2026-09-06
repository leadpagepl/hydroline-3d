import { site } from '../data/site'

const YEAR = new Date().getFullYear()

export function Footer() {
  const { phone, email, area, hours } = site.contact
  const details = [
    phone && { label: 'Telefon', value: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}` },
    email && { label: 'E-mail', value: email, href: `mailto:${email}` },
    area && { label: 'Obszar', value: area },
    hours && { label: 'Godziny', value: hours },
  ].filter(Boolean)

  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <div className="footer__brand">
          <span className="wordmark wordmark--static">
            <span className="wordmark__a">{site.wordmark[0]}</span>
            <span className="wordmark__b">{site.wordmark[1]}</span>
            <span className="wordmark__dot" aria-hidden="true" />
          </span>
          <p className="label footer__scope">Instalacje · Ogrzewanie · Naprawy</p>
        </div>

        <nav className="footer__nav" aria-label="Stopka">
          <a href="#uslugi">Usługi</a>
          <a href="#realizacje">Realizacje</a>
          <a href="#o-nas">O nas</a>
          <a href="#kontakt">Kontakt</a>
        </nav>

        {details.length > 0 && (
          <dl className="footer__details">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="label">{d.label}</dt>
                <dd>{d.href ? <a href={d.href}>{d.value}</a> : d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="footer__legal label">© {YEAR} {site.name}</p>
      </div>
    </footer>
  )
}
