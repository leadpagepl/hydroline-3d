import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../lib/motion'
import { AssemblyModel } from './AssemblyModel'
import { PARTS } from './assemblyParts'
import { Lighting } from './Lighting'

function WebGLFallback() {
  return <p className="assembly__fallback">Nie można wyświetlić modelu 3D w tej przeglądarce. Możesz zobaczyć zdjęcia instalacji poniżej.</p>
}
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <WebGLFallback /> : this.props.children }
}
function supportsWebGL() {
  try { const canvas = document.createElement('canvas'); return !!canvas.getContext('webgl2') } catch { return false }
}

export function AssemblyViewer({ tier, reducedMotion }) {
  const wrap = useRef(null), surface = useRef(null), api = useRef(null), gesture = useRef(null)
  const route = useRef(null), details = useRef(null), rail = useRef(null), activeLine = useRef(null), entry = useRef(null)
  const state = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0, explodeProgress: 0, selected: null, hovered: null, exit: 0, fitted: false, focusRevision: 0, inspection: false })
  const [supported] = useState(supportsWebGL)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState(null)
  const [displayed, setDisplayed] = useState(null)
  const [mode, setMode] = useState('rotate')
  const [hovered, setHovered] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [dragUsed, setDragUsed] = useState(false)
  const [partUsed, setPartUsed] = useState(false)
  const expandedRef = useRef(false)
  const busyRef = useRef(false)
  const onReady = useCallback(() => setReady(true), [])

  const select = useCallback(id => {
    entry.current?.kill()
    if (id === state.current.selected) return
    state.current.selected = id
    state.current.focusRevision++
    state.current.inspection = !!id
    setSelected(id)
    if (id) { setPartUsed(true); setMode('parts') }
  }, [])

  useLayoutEffect(() => {
    // Delay copy until the physical transition is underway. Rapid navigation
    // cancels this timeline so stale labels can never arrive out of order.
    const timeline = gsap.timeline()
    timeline.to(details.current, { opacity: 0, y: -8, duration: reducedMotion ? 0.06 : 0.2, ease: 'power2.in' }, reducedMotion ? 0 : 0.16)
      .call(() => setDisplayed(selected), [], reducedMotion ? 0.06 : 0.48)
      .set(details.current, { y: 12 })
      .to(details.current, { opacity: 1, y: 0, duration: reducedMotion ? 0.08 : 0.4, ease: 'power3.out' })
    if (selected && route.current) timeline.fromTo(route.current, { strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 0.28, duration: reducedMotion ? 0 : 0.6 }, 0.18)
    return () => timeline.kill()
  }, [selected, reducedMotion])

  useLayoutEffect(() => {
    const node = rail.current
    const update = () => {
      const button = node.querySelector(`[data-mode="${mode}"]`)
      gsap.to(activeLine.current, { x: button.offsetLeft, width: button.offsetWidth, duration: reducedMotion ? 0 : 0.45, ease: 'power3.inOut', overwrite: true })
    }
    update()
    const observer = new ResizeObserver(update); observer.observe(node)
    return () => { observer.disconnect(); gsap.killTweensOf(activeLine.current) }
  }, [mode, reducedMotion])

  const assemble = useCallback((open) => {
    const wasFocused = !!state.current.selected
    entry.current?.kill()
    expandedRef.current = open
    busyRef.current = true
    setExpanded(open); setBusy(true); select(null); setMode('assembly')
    state.current.inspection = false
    state.current.hovered = null; setHovered(null)
    gsap.to(state.current, { explodeProgress: open ? 1 : 0, delay: wasFocused && !reducedMotion ? 0.85 : 0, duration: reducedMotion ? 0.2 : 1.4, ease: 'power3.inOut', overwrite: 'auto', onComplete: () => { busyRef.current = false; setBusy(false) } })
  }, [reducedMotion, select])

  useEffect(() => {
    const node = wrap.current
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '15% 0px' })
    observer.observe(node)
    let leaving = false
    const scroll = () => {
      const out = node.getBoundingClientRect().bottom < window.innerHeight * 0.45
      if (gesture.current || out === leaving) return
      leaving = out
      if (out && expandedRef.current) assemble(false)
      gsap.to(state.current, { exit: out ? 1 : 0, duration: reducedMotion ? 0 : 0.5, delay: out && busyRef.current ? 0.8 : 0, overwrite: 'auto' })
    }
    window.addEventListener('scroll', scroll, { passive: true })
    return () => { observer.disconnect(); window.removeEventListener('scroll', scroll); gsap.killTweensOf(state.current); entry.current?.kill() }
  }, [assemble, reducedMotion])

  function start(e) {
    if (!ready || !e.isPrimary || e.button !== 0 || gesture.current) return
    gesture.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.focus({ preventScroll: true })
  }
  function move(e) {
    const g = gesture.current
    if (g) {
      if (g.id !== e.pointerId) return
      if (!g.moved && Math.hypot(e.clientX - g.startX, e.clientY - g.startY) > 6) { g.moved = true; setDragging(true); setDragUsed(true) }
      if (g.moved) {
        state.current.targetY = THREE.MathUtils.clamp(state.current.targetY + (e.clientX - g.lastX) * 0.005, -1.13, 1.13)
        state.current.targetX = THREE.MathUtils.clamp(state.current.targetX + (e.clientY - g.lastY) * 0.003, -0.2094, 0.2094)
      }
      g.lastX = e.clientX; g.lastY = e.clientY
    } else if (ready && expanded && !busy && e.pointerType === 'mouse') {
      const hit = api.current?.pick(e.clientX, e.clientY, e.currentTarget.parentElement.getBoundingClientRect()) || null
      state.current.hovered = hit; setHovered(hit)
    }
  }
  function stop(e) {
    const g = gesture.current
    if (!g || g.id !== e.pointerId) return
    if (e.type === 'pointerup' && !g.moved && expanded && !busy) select(api.current?.pick(e.clientX, e.clientY, e.currentTarget.parentElement.getBoundingClientRect()) || null)
    gesture.current = null; setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  function key(e) {
    if (e.key === 'Escape') { closeFocus(); return }
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)) return
    e.preventDefault(); setDragUsed(true)
    if (e.key === 'Home') { state.current.targetX = 0; state.current.targetY = 0; return }
    state.current.targetY = THREE.MathUtils.clamp(state.current.targetY + (e.key === 'ArrowLeft' ? -0.12 : e.key === 'ArrowRight' ? 0.12 : 0), -1.13, 1.13)
    state.current.targetX = THREE.MathUtils.clamp(state.current.targetX + (e.key === 'ArrowUp' ? -0.04 : e.key === 'ArrowDown' ? 0.04 : 0), -0.2094, 0.2094)
  }
  function next(direction) {
    const index = PARTS.findIndex(p => p.id === state.current.selected)
    select(PARTS[(index + direction + PARTS.length) % PARTS.length].id)
  }
  function closeFocus() {
    select(null); state.current.inspection = false; setMode('rotate')
    surface.current?.focus({ preventScroll: true })
  }
  function enterParts() {
    if (state.current.selected) return
    setMode('parts'); state.current.inspection = true
    entry.current?.kill()
    entry.current = gsap.delayedCall(reducedMotion ? 0 : 0.28, () => select(PARTS[0].id))
  }
  const part = PARTS.find(p => p.id === displayed)
  const count = String(PARTS.length).padStart(2, '0')
  const index = String(PARTS.findIndex(p => p.id === displayed) + 1).padStart(2, '0')

  return <div className="assembly" ref={wrap} data-expanded={expanded} data-ready={ready} data-focused={!!selected} data-mode={mode} onKeyDown={e => { if (e.key === 'Escape') closeFocus() }}>
    <div className="assembly__stage">
      <svg className="assembly__routes" viewBox="0 0 600 600" fill="none" aria-hidden="true"><path d="M35 160H130V480H570" stroke="var(--cold)" /><path d="M560 100H470V530H75" stroke="var(--hot)" /><circle cx="130" cy="160" r="4" stroke="var(--cold)" /><circle cx="470" cy="530" r="4" stroke="var(--hot)" /></svg>
      <span className="label assembly__index">Model 01 / Zawór grzejnika</span>
      {supported ? <SceneBoundary><Canvas frameloop={visible ? 'always' : 'never'} dpr={[1, tier === 'mobile' ? 1.5 : 1.75]} camera={{ fov: 32, position: [0,0,65], near: 0.1, far: 300 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1; gl.outputColorSpace = THREE.SRGBColorSpace; gl.setClearAlpha(0) }}>
        <Lighting intensity={0.85} /><Suspense fallback={null}><AssemblyModel state={state} api={api} route={route} tier={tier} onReady={onReady} reducedMotion={reducedMotion} /></Suspense>
      </Canvas></SceneBoundary> : <WebGLFallback />}
      {!ready && supported && <p className="label assembly__loading" role="status">Wczytuję model…</p>}
      <svg className="assembly__focus-route" aria-hidden="true"><path ref={route} pathLength="1" fill="none" stroke="var(--cold)" /></svg>
      <div className="assembly__surface" ref={surface} tabIndex={ready ? 0 : -1} role="group" aria-label="Model zaworu. Przeciągnij lub użyj strzałek, żeby obrócić. Escape odznacza część. Home przywraca obrót."
        data-dragging={dragging} data-selectable={!!hovered} onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onKeyDown={key} onPointerLeave={() => { state.current.hovered = null; setHovered(null) }} />
      <p className="label assembly__hint" data-hidden={!ready || (expanded ? partUsed : dragUsed)}>{expanded ? 'Wybierz część' : 'Przeciągnij, żeby obrócić'}</p>
    </div>
    <div className="assembly__controls" ref={rail} aria-label="Sterowanie modelem">
      <span className="assembly__active-line" ref={activeLine} aria-hidden="true" />
      <button type="button" data-mode="rotate" aria-pressed={mode === 'rotate'} disabled={!ready} onClick={() => { closeFocus(); surface.current?.focus({ preventScroll: true }); setDragUsed(false) }}><span>01</span> Obróć</button>
      <button type="button" data-mode="assembly" disabled={!ready || busy} aria-pressed={mode === 'assembly'} onClick={() => assemble(!expanded)}><span>02</span> {expanded ? 'Złóż model' : 'Rozłóż model'} <i aria-hidden="true">{expanded ? '←' : '→'}</i></button>
      <button type="button" data-mode="parts" aria-pressed={mode === 'parts'} disabled={!ready || !expanded || busy} onClick={enterParts}><span>03</span> Części</button>
    </div>
    <div className="assembly__info">
      <div className="assembly__details" ref={details} aria-live="polite" aria-atomic="true">
        {part ? <><p className="label assembly__part-index"><span>{index} / {count}</span><span>Część</span></p><h2>{part.label}</h2><p>{part.description}</p></> : <p className="assembly__info-note">{expanded ? 'Wybierz część.' : 'Zawór grzejnika.'}</p>}
      </div>
      {selected && <div className="assembly__part-nav" aria-label="Przeglądanie części"><div className="assembly__part-rail"><button type="button" aria-label="Poprzednia część" onClick={() => next(-1)}><span>←</span></button><span className="label">{String(PARTS.findIndex(p => p.id === selected) + 1).padStart(2,'0')} / {count}</span><button type="button" aria-label="Następna część" onClick={() => next(1)}><span>→</span></button></div><button className="assembly__close" type="button" aria-label="Zamknij podgląd części" onClick={closeFocus}>Zamknij <span aria-hidden="true">×</span></button></div>}
    </div>
  </div>
}
