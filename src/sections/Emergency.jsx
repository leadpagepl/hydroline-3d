import { Headline, Rise } from '../components/Reveal'
import { Action, TextAction } from '../components/Action'
import { ctaHref } from '../data/site'

/**
 * The one intentional dark chapter — a controlled break in an otherwise bright
 * page. Red appears here and almost nowhere else.
 */
export function Emergency() {
  const callHref = ctaHref('call')

  return (
    <section className="emergency" aria-labelledby="emergency-title">
      <div className="shell emergency__inner">
        <div className="emergency__copy">
          <p className="label label--indexed emergency__label">
            <span className="dot dot--hot" aria-hidden="true" />
            Ogrzewanie
          </p>
          <Headline
            as="h2"
            size="l"
            id="emergency-title"
            className="emergency__title"
            lines={['Ogrzewanie']}
          />
          <Rise className="emergency__support">
            <p className="copy">
              Montaż i naprawa instalacji grzewczych.
            </p>
            <div className="emergency__actions">
              <Action href={ctaHref()} tone="hot">
                Zadzwoń
              </Action>
              {callHref && <TextAction href={callHref}>Zadzwoń</TextAction>}
            </div>
            <p className="label emergency__scope">Centralne ogrzewanie · Ciepła woda</p>
          </Rise>
        </div>

        <div className="emergency__image">
          <img
            src="/assets/emergency-leak-service.png"
            alt="Serwisant lokalizujący nieszczelność na przyłączu pod zasobnikiem"
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
