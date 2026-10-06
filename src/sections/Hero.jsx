import { useLayoutEffect, useRef } from 'react'
import { Action, TextAction } from '../components/Action'
import { gsap } from '../lib/motion'
import { useReducedMotion } from '../lib/hooks'
import { ctaHref } from '../data/site'

/**
 * Who the company is and what its work looks like: the copy on the left, the
 * same bathroom at installation stage and after handover on the right. No
 * slider, no interaction — two calm frames side by side.
 */
export function Hero() {
  const rootRef = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const root = rootRef.current
    const ctx = gsap.context(() => {
      const lines = root.querySelectorAll('.hero__title .line-mask > span')
      const steps = root.querySelectorAll('[data-intro]')
      const frames = root.querySelectorAll('.hero__frame')
      if (reduced) { gsap.set([lines, steps], { yPercent: 0, y: 0, opacity: 1 }); return }
      gsap.set(lines, { yPercent: 112 })
      gsap.set(steps, { y: 14, opacity: 0 })
      gsap.timeline({ delay: 0.1 })
        .to(root.querySelector('[data-intro="eyebrow"]'), { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
        .to(lines, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.07 }, 0.1)
        .to(root.querySelectorAll('[data-intro="body"]'), { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.07 }, 0.46)
        // the two frames are uncovered one after the other: work, then result
        .fromTo(frames, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', stagger: 0.18 }, 0.25)
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="hero" className="hero" ref={rootRef}>
      <div className="shell hero__grid">
        <div className="hero__copy">
          <p className="label hero__eyebrow" data-intro="eyebrow">
            <span className="dot" aria-hidden="true" />
            <span>Jacek Czuber <span aria-hidden="true">•</span> Firma instalacji sanitarnych</span>
          </p>

          <h1 className="display display--xl hero__title">
            <span className="line-mask">
              <span>Kompleksowe</span>
            </span>
            <span className="line-mask">
              <span>instalacje</span>
            </span>
            <span className="line-mask">
              <span>sanitarne</span>
            </span>
          </h1>

          <p className="lead hero__lead" data-intro="body">
            Montaż, naprawa, modernizacja instalacji wodociągowych, kanalizacyjnych, grzewczych, gazowych.
          </p>

          <div className="hero__actions" data-intro="body">
            <Action href={ctaHref('call')}>Zadzwoń</Action>
            <TextAction href="#uslugi">Zobacz usługi</TextAction>
          </div>

          {/* trust proof: part of the first screen, under the actions; it
              carries "since 1997", so the facts row below doesn't repeat it */}
          <div className="hero__trust trust" data-intro="body">
            <p className="trust__title">Blisko 30 lat doświadczenia</p>
            <p className="trust__text">Od 1997 roku realizujemy instalacje sanitarne.</p>
          </div>
          <div className="hero__scope label" data-intro="body">
            <span>Siedziba: Łódź</span><span>Realizacje także poza Łodzią</span>
          </div>
        </div>

        {/* before / after: the work in the wall, then the room handed over */}
        <div className="hero__pair">
          <figure className="hero__frame">
            <img src="/assets/hero-plumbing-installation.png"
              alt="Łazienka w trakcie montażu: stelaże, podejścia wodne, kanalizacyjne"
              width="1672" height="941" fetchPriority="high" decoding="async" />
            <figcaption className="hero__caption"><span className="label">01</span><span className="label">Instalacja</span></figcaption>
          </figure>
          <figure className="hero__frame hero__frame--after">
            <img src="/assets/hero-plumbing-finished.png"
              alt="Ta sama łazienka po odbiorze, z prysznicem walk-in"
              width="1672" height="941" decoding="async" />
            <figcaption className="hero__caption"><span className="label">02</span><span className="label">Odbiór</span></figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
