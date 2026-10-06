/**
 * Choreography for the valve in section 02 (scope).
 *
 * The section writes one story position per frame (see Scope.jsx):
 *   t = -1 … 0   the section entering
 *   t =  0 … 6   scope item k is active for t in [k - 1, k)
 *   t =  6 … 7   exit after the last item
 * The copy highlight, this pose and the drafting routes all derive from that
 * one value.
 *
 * Calm by design: one smooth curve through a pose at the centre of each item,
 * small changes of angle between neighbours, no hard cuts. The valve turns
 * slowly as the list is read and only opens up — partly, as a payoff — while
 * the last item is on screen. It is visual language, not a picture of each
 * service; only heating shows supply / return at its real connections.
 */

/** State names on the section (data-state): intro, then the six scope items. */
export const STATES = ['intro', 'woda', 'kanalizacja', 'ogrzewanie', 'gaz', 'kotlownie', 'wezly']

/**
 * Pipe connections that carry the supply / return routes. Head side =
 * thermostatic valve = supply, cap side = lockshield = return: the standard
 * radiator arrangement. Routes stop at the adapters, never cross the body.
 */
export const PORTS = { supply: 'adapter-left', ret: 'adapter-right' }

export const KEYS = ['rx', 'ry', 'rz', 'x', 'y', 'dist', 'explode', 'ports']

/**
 * Poses on top of the base 3/4 view. Angles in degrees (rx pitch, ry yaw,
 * rz roll), x / y as fractions of the stage, dist as a multiple of the
 * framing distance (lower = closer).
 */
export const POSES = {
  intro: { rx: 4, ry: -14, rz: 0, x: 0, y: 0, dist: 1.04, explode: 0 },
  water: { rx: 8, ry: 4, rz: -2, x: 0, y: 0.01, dist: 1, explode: 0 },
  sewer: { rx: 10, ry: 18, rz: -3, x: 0, y: 0, dist: 0.99, explode: 0 },
  heating: { rx: 18, ry: 10, rz: -4, x: 0, y: 0.02, dist: 0.95, explode: 0 },
  gas: { rx: 9, ry: 28, rz: -2, x: 0, y: 0, dist: 1, explode: 0 },
  boiler: { rx: 7, ry: 38, rz: -1, x: 0, y: 0.02, dist: 0.96, explode: 0 },
  // the payoff: the parts start to separate while 06 is read, never fully
  districtOpening: { rx: 10, ry: 34, rz: -3, x: 0, y: 0.01, dist: 1, explode: 0.22 },
  district: { rx: 12, ry: 28, rz: -4, x: 0, y: 0, dist: 1.06, explode: 0.62 },
  exit: { rx: 8, ry: 44, rz: -2, x: 0.1, y: 0.01, dist: 1.22, explode: 0.4 },
}

/** Keyframes at the centre of each item; smooth interpolation between. */
const TIMELINE = [
  [-1, POSES.intro],
  [0.5, POSES.water],
  [1.5, POSES.sewer],
  [2.5, POSES.heating],
  [3.5, POSES.gas],
  [4.5, POSES.boiler],
  [5.25, POSES.districtOpening],
  [6, POSES.district],
  [7, POSES.exit],
]

const clamp = (t) => Math.min(1, Math.max(0, t))
const smooth = (t) => t * t * (3 - 2 * t)

// Supply / return show only while heating (item 03, t in [2, 3)) is active,
// fading in and out across its edges — independent of the slow turn.
const portsAt = (t) => smooth(clamp((t - 1.85) / 0.3)) * (1 - smooth(clamp((t - 2.85) / 0.3)))

export function poseAt(t, reduced, out) {
  if (reduced) { for (const k of KEYS) out[k] = POSES.water[k]; out.ports = 0; return out }
  let i = 0
  while (i < TIMELINE.length - 2 && t > TIMELINE[i + 1][0]) i++
  const [t0, a] = TIMELINE[i]
  const [t1, b] = TIMELINE[i + 1]
  const f = smooth(clamp((t - t0) / (t1 - t0)))
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * f
  out.ports = portsAt(t)
  return out
}
