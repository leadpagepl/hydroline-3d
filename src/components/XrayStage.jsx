import { useRef, useState } from 'react'
import { useHasFinePointer } from '../lib/hooks'

export function XrayStage({ base, hidden, alt, hiddenAlt }) {
  const hostRef = useRef(null)
  const touch = useRef(null)
  const fine = useHasFinePointer()
  const [active, setActive] = useState(false)
  const [used, setUsed] = useState(false)
  const [pinned, setPinned] = useState(false)

  function move(e) {
    if (e.pointerType !== 'mouse' && touch.current !== e.pointerId) return
    const stage = hostRef.current
    const rect = stage.getBoundingClientRect()
    // Both photographs stay locked to the stage. Only mask coordinates change.
    stage.style.setProperty('--lens-x', `${Math.max(0, Math.min(rect.width, e.clientX - rect.left)) / rect.width * 100}%`)
    stage.style.setProperty('--lens-y', `${Math.max(0, Math.min(rect.height, e.clientY - rect.top)) / rect.height * 100}%`)
    setActive(true)
    setUsed(true)
  }

  function start(e) {
    if (!e.isPrimary || e.button !== 0 || touch.current !== null) return
    touch.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    move(e)
  }

  function stop(e) {
    if (touch.current !== e.pointerId) return
    touch.current = null
    setActive(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <figure className="xray" ref={hostRef} data-active={active} data-pinned={pinned}>
      <img className="xray__base" src={base} alt={alt} width="1672" height="941" decoding="async" draggable="false" />
      <img className="xray__hidden" src={hidden} alt={pinned ? hiddenAlt : ''} aria-hidden={!pinned}
        width="1672" height="941" decoding="async" draggable="false" />
      <div className="xray__surface" onPointerMove={move} onPointerDown={start}
        onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
        onPointerLeave={() => { if (touch.current === null) setActive(false) }} />
      <figcaption className="xray__control">
        <button type="button" className="reveal-control" data-quiet={used && !pinned}
          aria-label={pinned ? 'Ukryj instalację' : 'Pokaż całą instalację'} aria-pressed={pinned}
          onClick={() => { setPinned((v) => !v); setUsed(true) }}>
          <span className="reveal-control__dot" aria-hidden="true" />
          <span className="reveal-control__label">{pinned ? 'Ukryj instalację' : fine ? 'Przesuń kursorem' : 'Przeciągnij palcem'}</span>
          <span className="reveal-control__arrow" aria-hidden="true">→</span>
        </button>
      </figcaption>
    </figure>
  )
}
