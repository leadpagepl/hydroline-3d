import { useLayoutEffect, useRef, useState } from 'react'
import { Headline } from '../components/Reveal'
import { gsap, ScrollTrigger } from '../lib/motion'

const SERVICES = [
  {
    id: 'wodociagowe',
    index: '01',
    name: 'Instalacje wodociągowe',
    line: 'Montaż, wymiana instalacji wodociągowych.',
    tags: [['cold', 'ZW · zimna woda'], ['hot', 'CWU · ciepła woda']],
    image: '/assets/plumber-at-work.png',
    alt: 'Monter przy podejściach wody zimnej i ciepłej obok stelaża podtynkowego',
    width: 1536,
    height: 1024,
    position: '62% 50%',
  },
  {
    id: 'ogrzewanie',
    index: '02',
    name: 'Ogrzewanie',
    line: 'Montaż, naprawa, wymiana instalacji grzewczych.',
    tags: [['hot', 'Zasilanie'], ['cold', 'Powrót']],
    image: '/assets/project-boiler-room-after.png',
    alt: 'Kotłownia: kocioł wiszący, zasobnik ciepłej wody, rozdzielacze obiegów grzewczych',
    width: 1536,
    height: 1024,
    position: '50% 50%',
  },
  {
    id: 'kanalizacja',
    index: '03',
    name: 'Kanalizacja',
    line: 'Montaż, naprawa, wymiana instalacji kanalizacyjnych.',
    image: '/assets/hero-plumbing-installation.png',
    alt: 'Łazienka w trakcie montażu: stelaż WC, piony, podejścia kanalizacyjne, odpływ liniowy',
    width: 1672,
    height: 941,
    position: '50% 55%',
  },
  {
    id: 'armatura',
    index: '04',
    name: 'Armatura',
    line: 'Montaż, wymiana baterii, umywalek, WC, innych urządzeń sanitarnych.',
    image: '/assets/cta-premium-bathroom.png',
    alt: 'Łazienka z baterią podtynkową, umywalką na szafce, prysznicem walk-in',
    width: 1774,
    height: 887,
    position: '72% 50%',
  },
  {
    id: 'gaz',
    index: '05',
    name: 'Gaz, piece gazowe',
    line: 'Naprawa, montaż, wymiana instalacji gazowych, przeglądy gazowe, montaż, wymiana pieców gazowych.',
    note: 'Autoryzacja urządzeń Viessmann.',
    image: '/assets/about-master-plumber.png',
    alt: 'Instalator przy przyłączach kotła wiszącego',
    width: 1122,
    height: 1402,
    position: '60% 40%',
  },
  {
    id: 'wezly',
    index: '06',
    name: 'Węzły ciepłownicze',
    line: 'Montaż węzłów ciepłowniczych jednofunkcyjnych, dwufunkcyjnych, trzyfunkcyjnych wraz z odbiorami Veolia, UDT.',
    image: '/assets/detail-manifold-system.png',
    alt: 'Rozdzielacz obiegów grzewczych z przepływomierzami, manometrami, zaworami',
    width: 1536,
    height: 1024,
    position: '55% 50%',
  },
]

/**
 * Services read by scrolling alone. Desktop: the copy column scrolls, the
 * photograph for the service being read is held beside it. Mobile: one plain
 * column, each service with its own photograph. Nothing waits for a hover.
 */
export function Services() {
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const current = SERVICES[active]

  useLayoutEffect(() => {
    const root = rootRef.current
    const ctx = gsap.context(() => {
      // One reading line at 62% of the viewport. A service becomes active the
      // moment its number and name cross it — text and photograph switch
      // together, while the new copy is entering the reading zone.
      gsap.utils.toArray('.service', listRef.current).forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => { if (self.isActive) setActive(i) },
          // each service carries its own progress line
          onUpdate: (self) => el.style.setProperty('--progress', self.progress.toFixed(3)),
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="uslugi" className="section services" ref={rootRef} aria-labelledby="services-title">
      <span className="draft-field services__draft" aria-hidden="true" />

      <div className="shell services__inner">
        <div className="services__head">
          <p className="label label--indexed">
            <span className="label__num">03</span> Usługi
          </p>
          <Headline
            as="h2"
            size="l"
            id="services-title"
            className="services__title"
            lines={['Instalacje', 'sanitarne']}
          />
          <p className="copy services__intro">Montaż, naprawa, modernizacja instalacji sanitarnych.</p>
        </div>

        <div className="services__body">
          <ol className="services__list" ref={listRef}>
            {SERVICES.map((s, i) => (
              <li key={s.id} className={s.tags ? 'service service--circuit' : 'service'} data-active={i === active}>
                <span className="service__progress" aria-hidden="true" />
                <span className="service__index">{s.index}</span>
                <h3 className="service__name">{s.name}</h3>
                <p className="service__line">{s.line}</p>
                {s.note && <p className="service__note">{s.note}</p>}
                {s.tags && (
                  <ul className="service__tags">
                    {s.tags.map(([tone, label]) => (
                      <li key={label}><span className={`service__swatch service__swatch--${tone}`} aria-hidden="true" />{label}</li>
                    ))}
                  </ul>
                )}
                <div className="service__media">
                  <img src={s.image} alt={s.alt} width={s.width} height={s.height} loading="lazy" decoding="async" style={{ objectPosition: s.position }} />
                </div>
              </li>
            ))}
          </ol>

          <p className="copy services__more">
            <span className="label">Pełny zakres</span>
            Instalacje gazowe, kanalizacyjne, wody zimnej, ciepłej wody użytkowej, c.o., kotłownie, węzły cieplne,
            projekty instalacji, przeglądy gazowe.
          </p>
        </div>

        {/* desktop: one held stage, the photograph follows the service being read */}
        <div className="services__aside">
          <div className="services__stage" data-circuit={Boolean(current.tags)}>
            {/* supply / return pair, coloured only for the water and heating services */}
            <span className="services__rails" aria-hidden="true" />
            <div className="services__frame">
              {SERVICES.map((s, i) => (
                <div key={s.id} className="services__plate" data-active={i === active} aria-hidden={i !== active}>
                  <img src={s.image} alt={s.alt} width={s.width} height={s.height} loading="lazy" decoding="async" style={{ objectPosition: s.position }} />
                </div>
              ))}
            </div>
            <p className="services__counter label" aria-hidden="true"><b>{current.index}</b> / 06 · {current.name}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
