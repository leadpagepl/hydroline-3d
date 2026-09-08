import { useRef, useState } from 'react'
import { Headline } from '../components/Reveal'
import { TextAction } from '../components/Action'
import { site } from '../data/site'

const SERVICES = ['Instalacja wodna', 'Kanalizacja', 'Ogrzewanie', 'Instalacja gazowa', 'Modernizacja', 'Naprawa', 'Inne']

export function Contact() {
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [demoReady, setDemoReady] = useState(false)
  const formRef = useRef(null)

  function validate(form) {
    const data = new FormData(form)
    const next = {}
    if (!String(data.get('name') || '').trim()) next.name = 'Podaj imię.'
    if (!String(data.get('phone') || '').trim() && !String(data.get('email') || '').trim()) {
      next.contact = 'Podaj telefon albo e-mail.'
    }
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
          <p className="lead contact__lead">Masz problem z instalacją?<br />Zadzwoń.</p>
          <div className="contact__phone">
            <span className="label">Zadzwoń</span>
            <address>{site.contact.phone}<br /><br />{site.address[0]}<br />{site.address[1]}</address>
            <TextAction href="https://www.google.com/maps/search/?api=1&query=Stefana%20Jaracza%2076%2C%2090-251%20%C5%81%C3%B3d%C5%BA" target="_blank" rel="noopener noreferrer">Pokaż na mapie</TextAction>
          </div>
        </div>

        <form className="contact-form" ref={formRef} onSubmit={submit} noValidate>
          <div className="contact-form__row">
            <Field id="name" label="Imię" required error={errors.name} onChange={() => clearError('name')} autoComplete="name" />
            <Field id="phone" label="Telefon" type="tel" aria-invalid={Boolean(errors.contact)} aria-describedby={errors.contact ? 'contact-error' : undefined} onChange={() => clearError('contact')} autoComplete="tel" inputMode="tel" />
          </div>
          <Field id="email" label="E-mail" type="email" aria-invalid={Boolean(errors.contact)} aria-describedby={errors.contact ? 'contact-error' : undefined} onChange={() => clearError('contact')} autoComplete="email" inputMode="email" />
          {errors.contact && <small className="contact-form__group-error" id="contact-error" role="alert">{errors.contact}</small>}

          <fieldset className="contact-form__services">
            <legend>Co trzeba zrobić?</legend>
            <div className="contact-form__chips">
              {SERVICES.map((service, index) => (
                <label className="service-chip" key={service}>
                  <input type="radio" name="service" value={service} defaultChecked={index === 0} />
                  <span><i aria-hidden="true" />{service}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="form-field form-field--textarea" htmlFor="message">
            <span>Wiadomość <i aria-hidden="true">*</i></span>
            <textarea id="message" name="message" placeholder="Napisz, czego potrzebujesz." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} onChange={() => clearError('message')} />
            {errors.message && <small id="message-error" role="alert">{errors.message}</small>}
          </label>

          <div className="contact-form__upload">
            <div><span className="contact-form__upload-title">Dodaj zdjęcia</span><p>Dodaj zdjęcia instalacji.</p></div>
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
          <p className="contact-form__note">Odpowiem po przeczytaniu wiadomości.</p>

          <div className="contact-form__status" data-visible={demoReady} aria-live="polite">
            <strong>Formularz testowy.</strong>
            <p>Wiadomość nie została wysłana.</p>
          </div>
        </form>
      </div>
    </section>
  )
}

function Field({ id, label, type = 'text', required = false, error, ...props }) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label} {required && <i aria-hidden="true">*</i>}</span>
      <input id={id} name={id} type={type} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <small id={`${id}-error`} role="alert">{error}</small>}
    </label>
  )
}
