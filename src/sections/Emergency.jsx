import { Headline, Rise } from '../components/Reveal'
import { Action, TextAction } from '../components/Action'
import { ctaHref } from '../data/site'

/**
 * The one intentional dark chapter — a controlled break in an otherwise bright
 * page, kept strictly black and white.
 */
export function Emergency() {
  return (
    <section className="emergency" aria-labelledby="emergency-title">
      <div className="shell emergency__inner">
        <div className="emergency__copy">
          <p className="label label--indexed emergency__label">
            <span className="dot dot--hot" aria-hidden="true" />
            Instalacje grzewcze
          </p>
          <Headline
            as="h2"
            size="l"
            id="emergency-title"
            className="emergency__title"
            lines={['Ogrzewanie,', 'kotłownie']}
          />
          <Rise className="emergency__support">
            <p className="copy">
              Projektujemy, montujemy, modernizujemy instalacje grzewcze.
            </p>
            <div className="emergency__actions">
              <Action href={ctaHref('call')} tone="inverse">
                Zadzwoń
              </Action>
              <TextAction href={ctaHref()}>Napisz do nas</TextAction>
            </div>
            <p className="label emergency__scope">Instalacje c.o., ciepła woda użytkowa, kotłownie, węzły cieplne</p>
          </Rise>
        </div>

        <div className="emergency__image">
          <img
            src="/assets/project-boiler-room-after.png"
            alt="Kotłownia po modernizacji: kocioł wiszący, zasobnik ciepłej wody, rozdzielacze obiegów grzewczych"
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  )
}
