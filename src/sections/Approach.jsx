import { Headline, Rise, Figure } from '../components/Reveal'

/**
 * Two installation details shown in the existing editorial composition.
 */
export function Approach() {
  return (
    <section className="section approach" aria-labelledby="approach-title">
      <div className="shell">
        <div className="approach__head">
          <p className="label label--indexed">
            <span className="label__num">02</span> Detale
          </p>
          <Headline
            as="h2"
            size="l"
            id="approach-title"
            className="approach__title"
            lines={['Instalacja']}
          />
        </div>

        <div className="approach__stage">
          <figure className="approach__plate approach__plate--a">
            <Figure
              src="/assets/detail-press-fitting.png"
              alt="Zaciskanie złączki zaprasowywanej na rurze wielowarstwowej"
              width="1536"
              height="1024"
              parallax={4}
              objectPosition="58% 50%"
            />
            <figcaption className="approach__caption">
              <span className="dot dot--hot" aria-hidden="true" />
              <span className="label">Armatura</span>
            </figcaption>
          </figure>

          <Rise className="approach__note">
            <p className="copy">
              Montaż rur i połączeń.
            </p>
            <p className="copy approach__note-strong">
              Sprawdzenie instalacji przed zamknięciem ściany lub podłogi.
            </p>
          </Rise>

          <figure className="approach__plate approach__plate--b">
            <Figure
              src="/assets/detail-manifold-system.png"
              alt="Rozdzielacz instalacji z przepływomierzami i obiegami zasilania"
              width="1536"
              height="1024"
              parallax={7}
              from="left"
            />
            <figcaption className="approach__caption">
              <span className="dot dot--cold" aria-hidden="true" />
              <span className="label">Rozdział instalacji</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
