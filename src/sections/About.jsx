import { Headline, Rise, Figure } from '../components/Reveal'

export function About() {
  return (
    <section id="o-nas" className="section about" aria-labelledby="about-title">
      <div className="shell about__inner">
        <div className="about__portrait">
          <Figure
            src="/assets/about-master-plumber.png"
            alt="Instalator przy module hydraulicznym kotła"
            width="1122"
            height="1402"
            parallax={3}
            objectPosition="52% 32%"
          />
        </div>

        <div className="about__text">
          <p className="label label--indexed">
            <span className="label__num">05</span> Firma
          </p>
          <Headline
            as="h2"
            size="l"
            id="about-title"
            className="about__title"
            lines={['Doświadczenie', 'od 1997 roku']}
          />
          <Rise className="about__support" delay={0.06}>
            <p className="lead">
              Nasza firma działa na rynku od 1997 roku. Od początku stawiamy na jakość wykonywanych usług
              instalacyjnych.
            </p>
            <p className="copy">Siedzibę mamy w Łodzi. Instalacje realizujemy również poza Łodzią.</p>
          </Rise>
        </div>
      </div>
    </section>
  )
}
