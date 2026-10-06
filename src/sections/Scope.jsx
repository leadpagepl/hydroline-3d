import { useLayoutEffect, useRef, useState } from 'react'
import { AssemblyViewer } from '../three/AssemblyViewer'
import { STATES } from '../three/pose'
import { gsap, ScrollTrigger } from '../lib/motion'
import { useIsMobile, useReducedMotion } from '../lib/hooks'

/** The scope, item by item. Colour only where a circuit is meant. */
const SCOPE = [
  { name: 'Woda', text: 'Instalacje wody zimnej, ciepłej wody użytkowej: montaż, wymiana.', tags: [['cold', 'ZW · zimna'], ['hot', 'CWU · ciepła']] },
  { name: 'Kanalizacja', text: 'Montaż, naprawa, wymiana instalacji kanalizacyjnych.' },
  { name: 'Ogrzewanie', text: 'Montaż, naprawa, wymiana instalacji grzewczych.', tags: [['hot', 'Zasilanie'], ['cold', 'Powrót']] },
  { name: 'Gaz', text: 'Instalacje gazowe, przeglądy gazowe, piece gazowe.' },
  { name: 'Kotłownie', text: 'Montaż, modernizacja kotłowni.' },
  { name: 'Węzły ciepłownicze', text: 'Węzły jedno-, dwu-, trzyfunkcyjne z odbiorami Veolia, UDT.' },
]

const lengthToPx = (value) => {
  const n = parseFloat(value)
  return value.trim().endsWith('vh') ? n * window.innerHeight / 100 : n
}

/**
 * 02 — the scope, with the valve as its technical detail. Left: the scope
 * list held in place while scrolling makes 01…06 active in turn. Right: the
 * one valve on the page, sticky for the stretch and gone before the services
 * begin.
 *
 * A single scroll mapping writes one story state (t, active, exit). The copy,
 * the model and the drafting routes all read that state — nothing has a
 * timing of its own that could drift.
 */
export function Scope() {
  const rootRef = useRef(null)
  const story = useRef({ t: -1, active: 0, exit: 0 })
  const [active, setActive] = useState(0)
  const [gone, setGone] = useState(false)
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()

  useLayoutEffect(() => {
    const root = rootRef.current
    let shown = -1
    let hidden = false
    const apply = (t, a, exit) => {
      Object.assign(story.current, { t, active: a, exit })
      root.style.setProperty('--exit', exit.toFixed(3))
      if (a !== shown) { shown = a; root.dataset.state = STATES[a]; setActive(a) }
      if ((exit > 0.999) !== hidden) { hidden = exit > 0.999; setGone(hidden) }
    }

    const mm = gsap.matchMedia()
    mm.add({ desktop: '(min-width: 861px)', reduce: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
      if (!conditions.desktop) {
        // Mobile: no pinned story. The valve turns gently as it passes; the
        // scope list above it is plain, fully readable copy.
        apply(-1, 0, 0)
        if (conditions.reduce) return
        const track = (self) => apply(-1 + self.progress * 1.2, 0, 0)
        ScrollTrigger.create({ trigger: root.querySelector('.story__visual'), start: 'top 85%', end: 'bottom 15%', onUpdate: track, onRefresh: track })
        return
      }

      // Desktop: the section enters, 01 lights up as the panel settles, each
      // item owns an equal stretch of scroll, and after 06 the exit stretch
      // takes the valve out before the panel lets go.
      const scope = root.querySelector('.scope')
      // The panel's height depends on which item is open. It lets go while
      // 06 is open, so measure it in that state: flip the attributes with
      // transitions off, read, restore, flush — nothing is ever painted.
      const endHeight = (panel) => {
        const items = [...panel.querySelectorAll('.scope__item')]
        const before = items.map((it) => it.dataset.active)
        panel.classList.add('is-measuring')
        items.forEach((it, j) => { it.dataset.active = String(j === items.length - 1) })
        const height = panel.offsetHeight
        items.forEach((it, j) => { it.dataset.active = before[j] })
        void panel.offsetHeight
        panel.classList.remove('is-measuring')
        return height
      }
      let m = null
      const measure = () => {
        const vh = window.innerHeight
        const css = getComputedStyle(root)
        const header = lengthToPx(css.getPropertyValue('--header-h')) || 72
        const exitLen = lengthToPx(css.getPropertyValue('--exit-seg')) || vh * 0.3
        // the panel is content-sized: it pins at its own sticky offset and
        // lets go when the scope's bottom reaches the panel's bottom
        const panel = scope.querySelector('.scope__panel')
        const stickyTop = parseFloat(getComputedStyle(panel).top) || header
        const r = scope.getBoundingClientRect()
        const enter = root.getBoundingClientRect().top + window.scrollY - vh
        const pin = r.top + window.scrollY - stickyTop
        const unpin = r.bottom + window.scrollY - (stickyTop + endHeight(panel))
        const start = Math.max(enter + 1, pin - vh * 0.3)
        const end = unpin - exitLen
        m = { enter, start, end, seg: (end - start) / 6, exitLen }
      }
      // story position t: -1…0 section entering, 0…6 items (k active on
      // [k-1, k)), 6…7 exit
      const update = (y) => {
        if (!m) return
        if (y < m.start) { apply(Math.max(-1, (y - m.enter) / (m.start - m.enter) - 1), 0, 0); return }
        const into = Math.min(6, (y - m.start) / m.seg)
        const exit = Math.min(1, Math.max(0, (y - m.end) / m.exitLen))
        apply(into + exit, Math.min(6, Math.floor(into) + 1), exit)
      }
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onRefresh: () => { measure(); update(window.scrollY) },
        onUpdate: (self) => update(self.scroll()),
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="zakres" className="story" ref={rootRef} data-state="intro" aria-labelledby="scope-title">
      <div className="shell story__grid">
        <div className="story__visual">
          <div className="story__sticky">
            {/* desktop: the stage spans the scene, the valve sits well right of
                centre, behind the copy's right-hand space */}
            <AssemblyViewer tier={isMobile ? 'mobile' : 'desktop'} offsetX={isMobile ? 0 : 0.52} reducedMotion={reduced} story={story} paused={gone} />
          </div>
        </div>

        <div className="scope">
          <div className="scope__panel">
            <div className="scope__head">
              <p className="label label--indexed"><span className="label__num">02</span> Zakres</p>
              <h2 className="display scope__title" id="scope-title">Od podstaw do odbioru</h2>
              <p className="scope__lead">Prowadzimy instalacje od projektu, przez montaż, po odbiór.</p>
            </div>

            <div className="scope__body">
              {/* the hot / cold pair ends here, under the last item */}
              <span className="scope__rails" aria-hidden="true">
                <span className="scope__rail-end scope__rail-end--a" />
                <span className="scope__rail-end scope__rail-end--b" />
              </span>
              <ol className="scope__list">
                {SCOPE.map((item, i) => (
                  <li className="scope__item" key={item.name} data-active={active === i + 1}>
                    <span className="scope__index">{String(i + 1).padStart(2, '0')}</span>
                    <span className="scope__name">{item.name}</span>
                    {/* desktop opens this only for the active item; it stays
                        in the DOM so screen readers always get it */}
                    <div className="scope__more">
                      <div className="scope__more-inner">
                        <p className="scope__text">{item.text}</p>
                        {item.tags && (
                          <span className="scope__tags">
                            {item.tags.map(([tone, label]) => (
                              <span className={`scope__tag scope__tag--${tone}`} key={label}><span className={`dot dot--${tone}`} aria-hidden="true" />{label}</span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
