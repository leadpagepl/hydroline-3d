import * as THREE from 'three'
import { partAnchor } from './assemblyParts'
import { PORTS } from './pose'

/**
 * Model routes: supply and return as short leads off the valve's two pipe
 * adapters, shown while the copy talks about heating. Their legend
 * (Zasilanie / Powrót) sits with the active copy, not by the valve. Every
 * point is projected from the live 3D pose (rotation, explode, camera) each
 * frame and written straight to the DOM, so a route can never stay behind
 * when the valve moves. A route is a few dozen pixels long and ends in the valve's
 * immediate surroundings; the stage's background routes are a separate system.
 *
 * Routes follow the adapters' real assembly axis and start at their outer
 * face. They never cross the valve body: the GLB says where pipes attach,
 * not how water moves inside.
 */

const P = new THREE.Vector3()
const Q = new THREE.Vector3()
const MOUTH = { x: 0, y: 0 }
const STUB = { x: 0, y: 0 }

// screen-space elbow after the pipe stub: down, then out to the side
const DROP = 22
const RUN = 34

const n = (value) => value.toFixed(1)

function project(point, camera, size, out) {
  P.copy(point).project(camera)
  out.x = (P.x + 1) * size.width / 2
  out.y = (1 - P.y) * size.height / 2
  return out
}

function fade(o, el, value) {
  if (!el) return
  const v = value < 0.03 ? 0 : value > 0.99 ? 1 : Math.round(value * 100) / 100
  if (o.cache.get(el) === v) return
  o.cache.set(el, v)
  el.style.opacity = v
}

function drawRoute(o, key, amount, ctx) {
  const route = o[key]
  fade(o, route?.group, amount)
  if (!route?.group || amount < 0.005) return
  const { data, camera, size, byId, explode } = ctx
  const part = byId.get(PORTS[key])
  // outer face of the adapter, then the same axis continued out as a pipe stub
  project(partAnchor(data, part, explode, data.span * 0.006, Q), camera, size, MOUTH)
  project(partAnchor(data, part, explode, data.span * 0.1, Q), camera, size, STUB)
  const side = key === 'supply' ? -1 : 1
  const endY = STUB.y + DROP
  const endX = STUB.x + side * RUN
  const d = `M${n(MOUTH.x)} ${n(MOUTH.y)}L${n(STUB.x)} ${n(STUB.y)}V${n(endY)}H${n(endX)}`
  route.path.setAttribute('d', d)
  route.flow.setAttribute('d', d)
  route.mouth.setAttribute('cx', n(MOUTH.x))
  route.mouth.setAttribute('cy', n(MOUTH.y))
  route.end.setAttribute('cx', n(endX))
  route.end.setAttribute('cy', n(endY))
  // drawn out of the valve
  route.path.style.strokeDashoffset = n(1 - amount)
  fade(o, route.flow, amount)
}

export function drawOverlay(o, ctx) {
  if (!o?.svg) return
  const { ports, explode } = ctx.view
  // return follows supply by a beat, so the pair reads as two circuits
  const ret = Math.min(1, Math.max(0, (ports - 0.25) / 0.75))
  drawRoute(o, 'supply', ports, { ...ctx, explode })
  drawRoute(o, 'ret', ret, { ...ctx, explode })
}
