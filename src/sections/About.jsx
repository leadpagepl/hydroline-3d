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
            <span className="label__num">05</span> O nas
          </p>
          <Headline
            as="h2"
            size="l"
            id="about-title"
            className="about__title"
            lines={['Rozmawiasz', 'z osobą,', 'która robi', 'tę pracę.']}
          />
          <Rise className="about__support" delay={0.06}>
            <p className="lead">Od początku wiesz, kto zajmuje się Twoją instalacją.</p>
            <p className="copy">
              Możesz zapytać, co trzeba zrobić, ile to potrwa i jaki będzie koszt.
            </p>
          </Rise>
        </div>
      </div>
    </section>
  )
}
