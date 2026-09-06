import { useState } from 'react'
import { Headline } from '../components/Reveal'
import { Compare } from '../components/Compare'

const PROJECTS = [
  {
    id: 'lazienka',
    name: 'Instalacja pod umywalką',
    scope: 'Wymieniliśmy stare połączenia i uporządkowaliśmy odpływ oraz doprowadzenie wody.',
    before: '/assets/project-plumbing-before.png',
    after: '/assets/project-plumbing-after.png',
    beforeAlt: 'Instalacja pod umywalką przed wymianą',
    afterAlt: 'Ta sama instalacja po wymianie podejść i zaworów',
  },
  {
    id: 'kotlownia',
    name: 'Modernizacja kotłowni',
    scope: 'Stara instalacja została uporządkowana i przebudowana.',
    before: '/assets/project-boiler-room-before.png',
    after: '/assets/project-boiler-room-after.png',
    beforeAlt: 'Kotłownia przed modernizacją',
    afterAlt: 'Kotłownia po modernizacji',
  },
]

export function Projects() {
  const [index, setIndex] = useState(0)
  const project = PROJECTS[index]

  return (
    <section id="realizacje" className="section projects" aria-labelledby="projects-title">
      <div className="shell">
        <div className="projects__head">
          <div>
            <p className="label label--indexed">
              <span className="label__num">04</span> Realizacje
            </p>
            <Headline
              as="h2"
              size="l"
              id="projects-title"
              className="projects__title"
              lines={['Zobacz, jak', 'wygląda nasza praca.']}
            />
          </div>

          <div className="projects__switch">
            {PROJECTS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="projects__tab"
                data-active={i === index}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
              >
                <span className="projects__tab-dot" aria-hidden="true" />
                <span className="projects__tab-name">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="projects__stage" aria-live="polite">
          <Compare
            key={project.id}
            before={project.before}
            after={project.after}
            beforeAlt={project.beforeAlt}
            afterAlt={project.afterAlt}
          />
          <p className="label projects__scope">{project.scope}</p>
        </div>
      </div>
    </section>
  )
}
