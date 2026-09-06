import { useRef, useState } from 'react'
import { Headline } from '../components/Reveal'
import { site } from '../data/site'

const SERVICES = ['Nowa instalacja', 'Naprawa', 'Ogrzewanie', 'Kotłownia', 'Łazienka / armatura', 'Modernizacja', 'Inne']

export function Contact() {
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [demoReady, setDemoReady] = useState(false)
  const formRef = useRef(null)
  const phone = site.contact.phone

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
          <Headline as="h2" size="l" id="contact-title" className="contact__title" lines={['Napisz,', 'co trzeba', 'zrobić.']} />
          <p className="lead contact__lead">Opisz problem albo planowane prace. Jeśli masz zdjęcia, możesz je dodać. Odpowiemy, czego potrzebujemy do wyceny.</p>
          <div className="contact__phone">
            <span className="label">Wolisz zadzwonić?</span>
            {phone ? <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a> : <span aria-label="Numer telefonu do uzupełnienia">+48 XXX XXX XXX</span>}
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
            <textarea id="message" name="message" placeholder="Napisz krótko, czego potrzebujesz. Na przykład: Cieknie zawór pod zlewem." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} onChange={() => clearError('message')} />
            {errors.message && <small id="message-error" role="alert">{errors.message}</small>}
          </label>

          <div className="contact-form__upload">
            <div><span className="contact-form__upload-title">Dodaj zdjęcia</span><p>Jeśli możesz, dodaj zdjęcia instalacji albo miejsca naprawy.</p></div>
            <label className="upload-control">
              <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { setFiles(Array.from(e.target.files || [])); setDemoReady(false) }} />
              <span>Wybierz zdjęcia</span>
            </label>
            {files.length > 0 && <div className="contact-form__files" aria-live="polite"><strong>Wybrano: {files.length}</strong><ul>{files.map((file) => <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>)}</ul></div>}
          </div>

          <button className="action contact-form__submit" type="submit">
            <span className="action__body">Wyślij zapytanie</span>
            <span className="action__arrow" aria-hidden="true">→</span>
          </button>
          <p className="contact-form__note">Odpowiemy, gdy zapoznamy się z wiadomością.</p>

          <div className="contact-form__status" data-visible={demoReady} aria-live="polite">
            <strong>Formularz działa w trybie demo.</strong>
            <p>Dane zostały sprawdzone, ale nic nie zostało wysłane. Po podłączeniu formularza wiadomość będzie można wysłać stąd.</p>
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
