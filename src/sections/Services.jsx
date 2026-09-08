import { useEffect, useRef, useState } from 'react'
import { Headline } from '../components/Reveal'
import { useIsMobile } from '../lib/hooks'

const SERVICES = [
  {
    id: 'instalacje',
    index: '01',
    name: 'Instalacje wodne',
    line: 'Montaż nowych instalacji wodnych.',
    image: '/assets/planning-installation.png',
    alt: 'Rysunek instalacji łazienki, złączki i narzędzia pomiarowe na stole',
    width: 1448,
    height: 1086,
    position: '50% 45%',
    tone: 'cold',
  },
  {
    id: 'ogrzewanie',
    index: '02',
    name: 'Ogrzewanie',
    line: 'Montaż i naprawa instalacji grzewczych.',
    image: '/assets/plumber-at-work.png',
    alt: 'Monter składający instalację przy stelażu podtynkowym',
    width: 1536,
    height: 1024,
    position: '55% 50%',
    tone: 'hot',
  },
  {
    id: 'kanalizacja',
    index: '03',
    name: 'Kanalizacja',
    line: 'Naprawa i wymiana instalacji kanalizacyjnych.',
    image: '/assets/project-boiler-room-after.png',
    alt: 'Kotłownia po modernizacji: kocioł, zasobnik i rozdzielacz obiegów',
    width: 1536,
    height: 1024,
    position: '50% 50%',
    tone: 'cold',
  },
  {
    id: 'armatura', index: '04', name: 'Montaż armatury',
    line: 'Montaż baterii, umywalek, WC i innych urządzeń.',
    image: '/assets/detail-manifold-system.png', alt: 'Rozdzielacz instalacji', width: 1536, height: 1024, position: '50% 50%', tone: 'hot',
  },
  {
    id: 'naprawy', index: '05', name: 'Naprawy',
    line: 'Naprawa przecieków i usterek.',
    image: '/assets/hero-plumbing-finished.png', alt: 'Gotowa łazienka z zamontowaną armaturą', width: 1672, height: 941, position: '60% 50%', tone: 'cold',
  },
  {
    id: 'wymiana', index: '06', name: 'Wymiana instalacji',
    line: 'Wymiana starych rur i instalacji.',
    image: '/assets/emergency-leak-service.png', alt: 'Sprawdzanie miejsca przecieku', width: 1536, height: 1024, position: '50% 50%', tone: 'hot',
  },
]

export function Services() {
  const [active, setActive] = useState(0)
  const isMobile = useIsMobile()
  const listRef = useRef(null)

  // On touch there is no hover, so the list drives the stage as it scrolls past.
  useEffect(() => {
    if (!isMobile) return
    const items = listRef.current?.querySelectorAll('.service')
    if (!items?.length) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.i))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [isMobile])

  return (
    <section id="uslugi" className="section services" aria-labelledby="services-title">
      <span className="draft-field services__draft" aria-hidden="true" />

      <div className="shell services__inner">
        <div className="services__head">
          <p className="label label--indexed">
            <span className="label__num">03</span> Zakres
          </p>
          <Headline
            as="h2"
            size="l"
            id="services-title"
            className="services__title"
            lines={['Usługi']}
          />
          <p className="copy services__intro">Montaż, naprawa i wymiana instalacji.</p>
        </div>

        {/* one image stage for the whole list — rows, not cards */}
        <div className="services__stage">
          {SERVICES.map((s, i) => (
            <div key={s.id} className="services__plate" data-active={i === active} aria-hidden={i !== active}>
              <img
                src={s.image}
                alt={s.alt}
                width={s.width}
                height={s.height}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: s.position }}
              />
            </div>
          ))}
        </div>

        <ul className="services__list" ref={listRef}>
          {SERVICES.map((s, i) => (
            <li
              key={s.id}
              className="service"
              data-i={i}
              data-active={i === active}
              data-tone={s.tone}
              onMouseEnter={() => setActive(i)}
            >
              <button type="button" className="service__row" onFocus={() => setActive(i)} onClick={() => setActive(i)}>
                <span className="service__index" aria-hidden="true">
                  {s.index}
                </span>
                <span className="service__name">{s.name}</span>
                <span className="service__line">{s.line}</span>
                <span className="service__mark" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
