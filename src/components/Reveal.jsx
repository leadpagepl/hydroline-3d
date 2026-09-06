import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { useReducedMotion } from '../lib/hooks'

/**
 * Display headline whose lines rise out of their own mask.
 * The mask wrapper carries extra bottom room so Polish ogoneks (Ą, Ę) are
 * never clipped — see `.line-mask` in base.css.
 */
export function Headline({ lines, as: Tag = 'h2', size = 'l', className = '', start = 'top 82%', id }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const spans = el.querySelectorAll('.line-mask > span')
    if (reduced) {
      gsap.set(spans, { yPercent: 0, opacity: 1 })
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        spans,
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: 1.05,
          ease: 'expo.out',
          stagger: 0.065,
          scrollTrigger: { trigger: el, start },
        }
      )
    }, el)
    return () => ctx.revert()
  }, [reduced, start])

  return (
    <Tag ref={ref} id={id} className={`display display--${size} ${className}`}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  )
}

/** Copy and small print: a short rise, never a bare fade-up on its own. */
export function Rise({ children, delay = 0, className = '', y = 22 }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        }
      )
    })
    return () => ctx.revert()
  }, [reduced, delay, y])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/**
 * Image that is uncovered by a moving crop rather than faded in, with an
 * optional slow counter-scroll inside its own frame.
 */
export function Figure({
  src,
  alt = '',
  width,
  height,
  className = '',
  parallax = 0,
  from = 'bottom',
  eager = false,
  objectPosition,
}) {
  const frameRef = useRef(null)
  const imgRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const frame = frameRef.current
    const img = imgRef.current
    if (!frame || !img) return

    if (reduced) {
      gsap.set(frame, { clipPath: 'inset(0% 0% 0% 0%)' })
      return
    }

    const hidden =
      from === 'left'
        ? 'inset(0% 100% 0% 0%)'
        : from === 'right'
          ? 'inset(0% 0% 0% 100%)'
          : 'inset(0% 0% 100% 0%)'

    const ctx = gsap.context(() => {
      gsap.fromTo(
        frame,
        { clipPath: hidden },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.25,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: frame, start: 'top 88%' },
        }
      )
      gsap.fromTo(
        img,
        { scale: 1.16 },
        {
          scale: 1,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: frame, start: 'top 88%' },
        }
      )
      if (parallax) {
        gsap.fromTo(
          img,
          { yPercent: -parallax },
          {
            yPercent: parallax,
            ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        )
      }
    })
    return () => ctx.revert()
  }, [reduced, parallax, from])

  return (
    <div ref={frameRef} className={`figure ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  )
}
