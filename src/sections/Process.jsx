import { Headline, Rise } from '../components/Reveal'

const STEPS = [
  ['01', 'Kontakt', 'Opisujesz, czego potrzebujesz.'],
  ['02', 'Sprawdzenie', 'Oglądamy instalację albo zdjęcia.'],
  ['03', 'Plan', 'Mówimy, co trzeba zrobić.'],
  ['04', 'Wycena', 'Dostajesz koszt i zakres prac.'],
  ['05', 'Praca', 'Wykonujemy ustalone prace.'],
  ['06', 'Sprawdzenie', 'Na końcu sprawdzamy, czy wszystko działa.'],
]

export function Process() {
  return (
    <section className="section process" aria-labelledby="process-title">
      <div className="shell process__inner">
        <div className="process__head">
          <p className="label">Jak pracujemy</p>
          <Headline as="h2" size="l" id="process-title" className="process__title" lines={['Jak wygląda', 'zlecenie.']} />
          <Rise className="process__support">
            <p className="copy">Zabezpieczamy miejsce pracy. Po zakończeniu sprawdzamy instalację i sprzątamy.</p>
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
