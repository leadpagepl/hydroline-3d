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
            lines={['Doświadczenie']}
          />
          <Rise className="about__support" delay={0.06}>
            <p className="lead">Od lat zajmuję się instalacjami hydraulicznymi w Łodzi.</p>
            <p className="copy">Montaż, naprawa i wymiana instalacji.</p>
          </Rise>
        </div>
      </div>
    </section>
  )
}
