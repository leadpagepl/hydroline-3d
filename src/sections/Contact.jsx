import { useRef, useState } from 'react'
import { Headline } from '../components/Reveal'
import { TextAction } from '../components/Action'
import { site, phoneHref } from '../data/site'

// One @, no spaces, a dot in the domain: what a person can actually reply to.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Contact() {
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [demoReady, setDemoReady] = useState(false)
  const formRef = useRef(null)

  function validate(form) {
    const data = new FormData(form)
    const next = {}
    if (!String(data.get('name') || '').trim()) next.name = 'Podaj imię i nazwisko.'
    const email = String(data.get('email') || '').trim()
    if (!email) next.email = 'Podaj adres e-mail.'
    else if (!EMAIL.test(email)) next.email = 'Podaj poprawny adres e-mail, np. jan.kowalski@poczta.pl.'
    if (!String(data.get('message') || '').trim()) next.message = 'Napisz, czego potrzebujesz.'
    return next
  }

  function submit(e) {
    e.preventDefault()
    const next = validate(e.currentTarget)
    setErrors(next)
    setDemoReady(false)
    if (Object.keys(next).length) {
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector('[aria-invalid="true"]')
        first?.focus()
      })
      return
    }
    setDemoReady(true)
  }

  function clearError(key) {
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
    setDemoReady(false)
  }

  return (
    <section id="kontakt" className="section contact" aria-labelledby="contact-title">
      <div className="shell contact__inner">
        <div className="contact__copy">
          <p className="label label--indexed"><span className="label__num">06</span> Kontakt</p>
          <Headline as="h2" size="l" id="contact-title" className="contact__title" lines={['Kontakt']} />
          <p className="lead contact__lead">Opisz, czego potrzebujesz.<br />Napisz do nas lub zadzwoń.</p>
          <div className="contact__phone">
            <span className="label">Zadzwoń</span>
            {phoneHref() && <a className="contact__tel" href={phoneHref()}>{site.contact.phone}</a>}
            <span className="label contact__address-label">Adres</span>
            <address>{site.address[0]}<br />{site.address[1]}</address>
            <TextAction href="https://www.google.com/maps/search/?api=1&query=Stefana%20Jaracza%2076%2C%2090-251%20%C5%81%C3%B3d%C5%BA" target="_blank" rel="noopener noreferrer">Pokaż na mapie</TextAction>
          </div>
        </div>

        <form className="contact-form" ref={formRef} onSubmit={submit} noValidate>
          <Field id="name" label="Imię i nazwisko" required error={errors.name} onChange={() => clearError('name')} autoComplete="name" />
          <div className="contact-form__row">
            <Field id="email" label="E-mail" type="email" required error={errors.email} onChange={() => clearError('email')} autoComplete="email" inputMode="email" />
            <Field id="phone" label="Telefon" optional type="tel" onChange={() => setDemoReady(false)} autoComplete="tel" inputMode="tel" />
          </div>

          <label className="form-field form-field--textarea" htmlFor="message">
            <span>Wiadomość <i aria-hidden="true">*</i></span>
            <textarea id="message" name="message" required aria-required="true" placeholder="Napisz, czego potrzebujesz." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} onChange={() => clearError('message')} />
            {errors.message && <small id="message-error" role="alert">{errors.message}</small>}
          </label>

          <div className="contact-form__upload">
            <div><span className="contact-form__upload-title">Załączniki <span className="contact-form__optional">(opcjonalnie)</span></span><p>Zdjęcia instalacji: JPG, PNG, WEBP.</p></div>
            <label className="upload-control">
              <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { setFiles(Array.from(e.target.files || [])); setDemoReady(false) }} />
              <span>Wybierz zdjęcia</span>
            </label>
            {files.length > 0 && <div className="contact-form__files" aria-live="polite"><strong>Wybrano: {files.length}</strong><ul>{files.map((file) => <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>)}</ul></div>}
          </div>

          <button className="action contact-form__submit" type="submit">
            <span className="action__body">Wyślij</span>
            <span className="action__arrow" aria-hidden="true">→</span>
          </button>
          <p className="contact-form__note">Odpowiemy po przeczytaniu wiadomości.</p>

          <div className="contact-form__status" data-visible={demoReady} aria-live="polite">
            <strong>Formularz testowy.</strong>
            <p>Wiadomość nie została wysłana.</p>
          </div>
        </form>
      </div>
    </section>
  )
}

function Field({ id, label, type = 'text', required = false, optional = false, error, ...props }) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label} {required && <i aria-hidden="true">*</i>}{optional && <span className="contact-form__optional">(opcjonalnie)</span>}</span>
      <input id={id} name={id} type={type} required={required} aria-required={required || undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <small id={`${id}-error`} role="alert">{error}</small>}
    </label>
  )
}
