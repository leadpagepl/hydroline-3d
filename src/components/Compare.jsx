import { useLayoutEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/motion'
import { useReducedMotion } from '../lib/hooks'

const clamp = (value) => Math.max(0, Math.min(100, value))

/**
 * Before / after. Scrolling past it sweeps the divider from "before" to
 * "after" on its own; dragging or the arrow keys take over for good.
 */
export function Compare({ before, after, beforeAlt, afterAlt }) {
  const root = useRef(null)
  const handle = useRef(null)
  const drag = useRef(null)
  const manual = useRef(false)
  const pos = useRef(50)
  const reduced = useReducedMotion()
  const [isDragging, setDragging] = useState(false)

  // Written straight to the DOM: a scrubbed divider never re-renders React.
  function apply(value) {
    pos.current = clamp(value)
    root.current.style.setProperty('--pos', `${pos.current}%`)
    handle.current.setAttribute('aria-valuenow', Math.round(pos.current))
    handle.current.setAttribute('aria-valuetext', `${Math.round(pos.current)}% przed pracami`)
  }

  useLayoutEffect(() => {
    if (reduced) { if (!manual.current) apply(50); return }
    const sweep = (self) => { if (!manual.current) apply(88 - self.progress * 76) }
    const trigger = ScrollTrigger.create({ trigger: root.current, start: 'top 75%', end: 'bottom 35%', onUpdate: sweep, onRefresh: sweep })
    return () => trigger.kill()
  }, [reduced])

  function start(e) {
    if (!e.isPrimary || e.button !== 0 || drag.current) return
    // Preserve the grab offset: pressing anywhere on the stage never jumps.
    manual.current = true
    drag.current = { id: e.pointerId, x: e.clientX, pos: pos.current }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  function move(e) {
    const grab = drag.current
    if (!grab || grab.id !== e.pointerId) return
    const rect = e.currentTarget.getBoundingClientRect()
    apply(grab.pos + (e.clientX - grab.x) / rect.width * 100)
  }

  function stop(e) {
    if (drag.current?.id !== e.pointerId) return
    drag.current = null
    setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  function onKeyDown(e) {
    const next = { ArrowLeft: pos.current - 2, ArrowRight: pos.current + 2, Home: 0, End: 100 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    manual.current = true
    apply(next)
  }

  return (
    <div className="compare" ref={root} style={{ '--pos': '50%' }} data-dragging={isDragging}
      onPointerDown={start} onPointerMove={move} onPointerUp={stop}
      onPointerCancel={stop} onLostPointerCapture={stop}>
      <img className="compare__after" src={after} alt={afterAlt} loading="lazy" decoding="async" draggable="false" />
      <img className="compare__before" src={before} alt={beforeAlt} loading="lazy" decoding="async" draggable="false" />
      <span className="compare__divider">
        <span className="compare__handle" ref={handle} role="slider" tabIndex={0}
          aria-label="Porównanie przed i po — użyj strzałek w lewo i w prawo"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={50}
          aria-valuetext="50% przed pracami" aria-orientation="horizontal" onKeyDown={onKeyDown}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M10 7 6 12l4 5M14 7l4 5-4 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </span>
      <span className="compare__tag compare__tag--before" aria-hidden="true">Przed</span>
      <span className="compare__tag compare__tag--after" aria-hidden="true">Po</span>
    </div>
  )
}
