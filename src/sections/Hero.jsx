import { useLayoutEffect, useRef } from 'react'
import { AssemblyViewer } from '../three/AssemblyViewer'
import { XrayStage } from '../components/XrayStage'
import { Action, TextAction } from '../components/Action'
import { gsap } from '../lib/motion'
import { useIsMobile, useMediaQuery, useReducedMotion } from '../lib/hooks'
import { ctaHref } from '../data/site'

export function Hero() {
  const rootRef = useRef(null)
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const isTablet = useMediaQuery('(min-width: 861px) and (max-width: 1180px)')

  const tier = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

  // --- opening choreography (the 3D half runs on the same clock)
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const lines = root.querySelectorAll('.hero__title .line-mask > span')
      const steps = root.querySelectorAll('[data-intro]')

      if (reduced) {
        gsap.set([lines, steps], { yPercent: 0, y: 0, opacity: 1 })
        return
      }

      gsap.set(lines, { yPercent: 112 })
      gsap.set(steps, { y: 14, opacity: 0 })

      gsap
        .timeline({ delay: 0.1 })
        .to(root.querySelector('[data-intro="eyebrow"]'), { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
        .to(lines, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.07 }, 0.1)
        .to(
          root.querySelectorAll('[data-intro="body"]'),
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.07 },
          0.46
        )
        .to(
          root.querySelectorAll('[data-intro="stage"]'),
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
          0.6
        )
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="hero" className="hero" ref={rootRef}>
      <div className="shell hero__inner">
        <div className="hero__copy">
          <p className="label hero__eyebrow" data-intro="eyebrow">
            <span className="dot dot--cold" aria-hidden="true" />
            Instalacje wodne / ogrzewanie / naprawy
          </p>

          <h1 className="display display--xl hero__title">
            <span className="line-mask">
              <span>Robimy</span>
            </span>
            <span className="line-mask">
              <span>i naprawiamy</span>
            </span>
            <span className="line-mask">
              <span>instalacje.</span>
            </span>
          </h1>

          <p className="lead hero__lead" data-intro="body">
            Nowe instalacje, przeróbki i naprawy w domach i mieszkaniach. Najpierw sprawdzamy, co trzeba zrobić. Potem podajemy rozwiązanie i wycenę.
          </p>

          <div className="hero__actions" data-intro="body">
            <Action href={ctaHref()}>Zapytaj o wycenę</Action>
            <TextAction href="#realizacje">Zobacz realizacje</TextAction>
          </div>
          <div className="hero__scope label" data-intro="body" aria-label="Zakres usług">
            <span>Instalacje</span><span>Ogrzewanie</span><span>Naprawy</span>
          </div>
        </div>

        <AssemblyViewer tier={tier} reducedMotion={reduced} />
      </div>

      <div className="shell hero__stage" data-intro="stage">
        <div className="hero__stage-head">
          <div>
            <p className="label label--indexed"><span className="label__num">01</span> Pod ścianą</p>
            <h2 className="display hero__stage-title">Zobacz, co jest pod ścianą.</h2>
          </div>
          <p className="copy hero__stage-note">Gotowa łazienka wygląda prosto. Pod ścianą jest cała instalacja.</p>
        </div>

        <XrayStage
          base="/assets/hero-plumbing-finished.png"
          hidden="/assets/hero-plumbing-installation.png"
          alt="Wykończona łazienka z prysznicem walk-in"
          hiddenAlt="Ta sama łazienka na etapie instalacji: stelaże, podejścia wodne i kanalizacyjne"
        />
      </div>
    </section>
  )
}
