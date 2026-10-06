import { Headline } from '../components/Reveal'
import { Compare } from '../components/Compare'

const PROJECTS = [
  {
    id: 'lazienka',
    name: 'Woda, kanalizacja',
    scope: 'Instalacja wodna',
    before: '/assets/project-plumbing-before.png',
    after: '/assets/project-plumbing-after.png',
    beforeAlt: 'Instalacja pod umywalką przed wymianą',
    afterAlt: 'Ta sama instalacja po wymianie podejść i zaworów',
  },
  {
    id: 'kotlownia',
    name: 'Ogrzewanie',
    scope: 'Ogrzewanie',
    before: '/assets/project-boiler-room-before.png',
    after: '/assets/project-boiler-room-after.png',
    beforeAlt: 'Kotłownia przed modernizacją',
    afterAlt: 'Kotłownia po modernizacji',
  },
]

/** Both projects in one column; each comparison sweeps itself on scroll. */
export function Projects() {
  return (
    <section id="realizacje" className="section projects" aria-labelledby="projects-title">
      <div className="shell">
        <div className="projects__head">
          <p className="label label--indexed">
            <span className="label__num">04</span> Realizacje
          </p>
          <Headline
            as="h2"
            size="l"
            id="projects-title"
            className="projects__title"
            lines={['Realizacje']}
          />
          <p className="copy projects__intro">Instalacje, naprawy, modernizacje.</p>
        </div>

        <div className="projects__list">
          {PROJECTS.map((project, i) => (
            <article className="project" key={project.id} aria-labelledby={`project-${project.id}`}>
              <div className="project__head">
                <h3 className="label label--indexed project__name" id={`project-${project.id}`}>
                  <span className="label__num">{String(i + 1).padStart(2, '0')}</span> {project.name}
                </h3>
                <p className="label">{project.scope}: przed, po</p>
              </div>
              <Compare
                before={project.before}
                after={project.after}
                beforeAlt={project.beforeAlt}
                afterAlt={project.afterAlt}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
