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
            <span className="label__num">02</span> Plan
          </p>
          <Headline
            as="h2"
            size="l"
            id="approach-title"
            className="approach__title"
            lines={['Dobra instalacja', 'zaczyna się', 'od dobrego planu.']}
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
              <span className="label">Połączenia</span>
            </figcaption>
          </figure>

          <Rise className="approach__note">
            <p className="copy">
              Sprawdzamy przebieg rur, połączenia i miejsce montażu. Dzięki temu przed pracą wiadomo, co trzeba zrobić.
            </p>
            <p className="copy approach__note-strong">
              Każde połączenie sprawdzamy przed zamknięciem ściany lub podłogi.
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
              <span className="label">Rozdzielacz</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
