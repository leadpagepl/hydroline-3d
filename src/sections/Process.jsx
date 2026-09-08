import { Headline, Rise } from '../components/Reveal'
import { Action } from '../components/Action'
import { ctaHref } from '../data/site'

const STEPS = [
  ['01', 'Kontakt', 'Powiedz, czego potrzebujesz.'],
  ['02', 'Wycena', 'Ustalam zakres i koszt pracy.'],
  ['03', 'Praca', 'Wykonuję instalację lub naprawę.'],
  ['04', 'Odbiór', 'Sprawdzamy gotową pracę.'],
]

export function Process() {
  return (
    <section className="section process" aria-labelledby="process-title">
      <div className="shell process__inner">
        <div className="process__head">
          <p className="label">Współpraca</p>
          <Headline as="h2" size="l" id="process-title" className="process__title" lines={['Jak pracuję']} />
          <Rise className="process__support">
            <p className="copy">Kontakt, wycena, praca i odbiór.</p>
            <Action href={ctaHref()}>Zadzwoń</Action>
          </Rise>
        </div>
        <ol className="process__list">
          {STEPS.map(([index, name, text]) => (
            <li className="process__step" key={index}>
              <span className="process__index">{index}</span>
              <div><h3>{name}</h3><p>{text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
