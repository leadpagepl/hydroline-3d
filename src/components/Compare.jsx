import { useRef, useState } from 'react'

const clamp = (value) => Math.max(0, Math.min(100, value))

export function Compare({ before, after, beforeAlt, afterAlt }) {
  const drag = useRef(null)
  const [pos, setPos] = useState(52)
  const [isDragging, setDragging] = useState(false)

  function start(e) {
    if (!e.isPrimary || e.button !== 0 || drag.current) return
    // Preserve the grab offset: pressing anywhere on the stage never jumps.
    drag.current = { id: e.pointerId, x: e.clientX, pos }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  function move(e) {
    const grab = drag.current
    if (!grab || grab.id !== e.pointerId) return
    const rect = e.currentTarget.getBoundingClientRect()
    setPos(clamp(grab.pos + (e.clientX - grab.x) / rect.width * 100))
  }

  function stop(e) {
    if (drag.current?.id !== e.pointerId) return
    drag.current = null
    setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  function onKeyDown(e) {
    const next = { ArrowLeft: pos - 2, ArrowRight: pos + 2, Home: 0, End: 100 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    setPos(clamp(next))
  }

  return (
    <div className="compare" style={{ '--pos': `${pos}%` }} data-dragging={isDragging}
      onPointerDown={start} onPointerMove={move} onPointerUp={stop}
      onPointerCancel={stop} onLostPointerCapture={stop}>
      <img className="compare__after" src={after} alt={afterAlt} loading="lazy" decoding="async" draggable="false" />
      <img className="compare__before" src={before} alt={beforeAlt} loading="lazy" decoding="async" draggable="false" />
      <span className="compare__divider">
        <span className="compare__handle" role="slider" tabIndex={0}
          aria-label="Porównanie przed i po — użyj strzałek w lewo i w prawo"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% przed pracami`} aria-orientation="horizontal" onKeyDown={onKeyDown}>
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
