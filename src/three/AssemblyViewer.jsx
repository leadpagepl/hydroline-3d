import { Component, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../lib/motion'
import { AssemblyModel } from './AssemblyModel'
import { Lighting } from './Lighting'

function WebGLFallback() {
  return <p className="assembly__fallback">Nie można wyświetlić modelu 3D w tej przeglądarce.</p>
}
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <WebGLFallback /> : this.props.children }
}
function supportsWebGL() {
  try { const canvas = document.createElement('canvas'); return !!canvas.getContext('webgl2') } catch { return false }
}

/**
 * Background routes beside the valve: a few short grey drafting fragments in
 * the stage margins (90° elbows, nodes), never attached to the valve. Colour
 * stays with the copy on the left; here only the item's own line system
 * changes. Which group is drawn follows the section's data-state.
 */
const ROUTES = {
  drain: { paths: [['mono', 'M92 96V88H84']], nodes: [['mono', 84, 88]] },
  gas: { paths: [['mono', 'M90 76V84H97']], nodes: [['mono', 97, 84]] },
  plant: { paths: [['mono', 'M84 93H92V85']], nodes: [['mono', 92, 85]] },
}

/**
 * The one valve on the page, in the scope section. The section owns the
 * story state; the model, its circuit lines and the drafting routes only
 * read it. Turning the model by hand is a small extra and eases back once it
 * is off screen.
 */
export function AssemblyViewer({ tier, reducedMotion, story, paused = false, offsetX = 0 }) {
  const wrap = useRef(null), gesture = useRef(null)
  const overlay = useRef({ cache: new Map() })
  const svg = useRef(null)
  const supply = { group: useRef(null), path: useRef(null), flow: useRef(null), mouth: useRef(null), end: useRef(null) }
  const ret = { group: useRef(null), path: useRef(null), flow: useRef(null), mouth: useRef(null), end: useRef(null) }
  const state = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 })
  const [supported] = useState(supportsWebGL)
  const [visible, setVisible] = useState(true)
  const [dragging, setDragging] = useState(false)

  // Hand the DOM nodes to the frame loop once; it writes to them directly.
  useLayoutEffect(() => {
    const read = (refs) => Object.fromEntries(Object.entries(refs).map(([k, r]) => [k, r.current]))
    Object.assign(overlay.current, { svg: svg.current, supply: read(supply), ret: read(ret) })
    // refs are stable for the component's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Render only while on screen; a hand-turned pose is given back on leaving.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting)
      if (!entry.isIntersecting && !gesture.current) gsap.to(state.current, { targetX: 0, targetY: 0, duration: 0.6, overwrite: true })
    }, { rootMargin: '15% 0px' })
    observer.observe(wrap.current)
    return () => { observer.disconnect(); gsap.killTweensOf(state.current) }
  }, [])

  function start(e) {
    if (!e.isPrimary || e.button !== 0 || gesture.current) return
    gesture.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function move(e) {
    const g = gesture.current
    if (!g || g.id !== e.pointerId) return
    if (!g.moved && Math.hypot(e.clientX - g.startX, e.clientY - g.startY) > 6) { g.moved = true; setDragging(true) }
    if (g.moved) {
      state.current.targetY = THREE.MathUtils.clamp(state.current.targetY + (e.clientX - g.lastX) * 0.005, -1.13, 1.13)
      // Touch keeps vertical movement for page scroll (touch-action: pan-y).
      if (e.pointerType === 'mouse') state.current.targetX = THREE.MathUtils.clamp(state.current.targetX + (e.clientY - g.lastY) * 0.003, -0.2094, 0.2094)
    }
    g.lastX = e.clientX; g.lastY = e.clientY
  }
  function stop(e) {
    const g = gesture.current
    if (!g || g.id !== e.pointerId) return
    gesture.current = null; setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  function key(e) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return
    e.preventDefault()
    if (e.key === 'Home') { state.current.targetX = 0; state.current.targetY = 0; return }
    state.current.targetY = THREE.MathUtils.clamp(state.current.targetY + (e.key === 'ArrowLeft' ? -0.12 : e.key === 'ArrowRight' ? 0.12 : 0), -1.13, 1.13)
    state.current.targetX = THREE.MathUtils.clamp(state.current.targetX + (e.key === 'ArrowUp' ? -0.04 : e.key === 'ArrowDown' ? 0.04 : 0), -0.2094, 0.2094)
  }

  return <div className="assembly" ref={wrap}>
    <div className="assembly__stage">
      {/* background routes: short drafting fragments in the stage margins,
          never attached to the valve; every label is repeated in the copy */}
      <div className="routes" aria-hidden="true">
        <svg className="routes__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {Object.entries(ROUTES).map(([name, group]) => (
            <g key={name} className={`routes__group routes__group--${name}`}>
              {group.paths.map(([tone, d]) => (
                <path key={d} className={`routes__path routes__path--${tone}`} d={d} pathLength="1" vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          ))}
        </svg>
        {Object.entries(ROUTES).map(([name, group]) => (
          <div key={name} className={`routes__marks routes__group routes__group--${name}`}>
            {group.nodes.map(([tone, x, y]) => (
              <span key={`${x}-${y}`} className={`routes__node routes__node--${tone}`} style={{ left: `${x}%`, top: `${y}%` }} />
            ))}
            {group.tags?.map(([tone, label, x, y]) => (
              <span key={`${label}-${x}-${y}`} className={`label routes__tag routes__tag--${tone}`} style={{ left: `${x}%`, top: `${y}%` }}>{label}</span>
            ))}
          </div>
        ))}
      </div>

      <span className="label assembly__index">Detal · zawór grzejnikowy</span>
      {supported ? <SceneBoundary><Canvas frameloop={visible && !paused ? 'always' : 'never'} dpr={[1, tier === 'mobile' ? 1.5 : 1.75]} camera={{ fov: 32, position: [0, 0, 65], near: 0.1, far: 300 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1; gl.outputColorSpace = THREE.SRGBColorSpace; gl.setClearAlpha(0) }}>
        <Lighting intensity={0.85} /><Suspense fallback={null}><AssemblyModel state={state} story={story} overlay={overlay} reducedMotion={reducedMotion} offsetX={offsetX} /></Suspense>
      </Canvas></SceneBoundary> : <WebGLFallback />}

      <svg className="assembly__overlay" ref={svg} aria-hidden="true">
        <g className="assembly__circuit assembly__circuit--supply" ref={supply.group}>
          <path className="assembly__line" ref={supply.path} pathLength="1" />
          <path className="assembly__flow" ref={supply.flow} pathLength="1" />
          <circle className="assembly__node" ref={supply.mouth} r="2.5" />
          <circle className="assembly__node" ref={supply.end} r="3" />
        </g>
        <g className="assembly__circuit assembly__circuit--ret" ref={ret.group}>
          <path className="assembly__line" ref={ret.path} pathLength="1" />
          <path className="assembly__flow" ref={ret.flow} pathLength="1" />
          <circle className="assembly__node" ref={ret.mouth} r="2.5" />
          <circle className="assembly__node" ref={ret.end} r="3" />
        </g>
      </svg>

      <div className="assembly__surface" tabIndex={0} role="group"
        aria-label="Model 3D zaworu grzejnikowego. Strzałki obracają model, Home przywraca widok."
        data-dragging={dragging} onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onKeyDown={key} />
    </div>
  </div>
}
