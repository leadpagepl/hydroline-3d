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
            <span className="wordmark__stack">
              <span className="wordmark__name"><span className="wordmark__a">{site.wordmark[0]}</span> <span className="wordmark__b">{site.wordmark[1]}</span></span>
              <span className="wordmark__descriptor">{site.descriptor}</span>
            </span>
            <span className="wordmark__dot" aria-hidden="true" />
          </span>
          <p className="label footer__scope">Instalacje wodne · Kanalizacja · Ogrzewanie · Gaz</p>
        </div>

        <nav className="footer__nav" aria-label="Stopka">
          <a href="#uslugi">Usługi</a>
          <a href="#realizacje">Realizacje</a>
          <a href="#o-nas">O firmie</a>
          <a href="#kontakt">Kontakt</a>
        </nav>

        <dl className="footer__details">
          <div><dt className="label">Adres</dt><dd>{site.address[0]}<br />{site.address[1]}</dd></div>
          {details.length > 0 && details.map((d) => (
            <div key={d.label}>
              <dt className="label">{d.label}</dt>
              <dd>{d.href ? <a href={d.href}>{d.value}</a> : d.value}</dd>
            </div>
          ))}
        </dl>
        <div className="footer__legal">
          <p className="label">© {YEAR} Jacek Czuber „Zakład Hydrauliczny”</p>
          <p className="label">NIP {site.nip} · REGON {site.regon}</p>
          <p className="footer__credit">Strona wykonana przez <a href="https://leadpage.pl" target="_blank" rel="noopener noreferrer">leadpage.pl</a></p>
        </div>
      </div>
    </footer>
  )
}
