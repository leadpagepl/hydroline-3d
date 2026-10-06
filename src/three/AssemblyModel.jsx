import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '../lib/motion'
import { ASSEMBLY_URL, applyAssembly, prepareAssembly } from './assemblyParts'
import { KEYS, poseAt } from './pose'
import { drawOverlay } from './overlay'

const BASE = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.28, -0.38, -0.12, 'YXZ'))
const DEG = THREE.MathUtils.DEG2RAD
const P = new THREE.Vector3()
// share of the bounding-sphere fit used at dist = 1: the valve fills the
// stage in the hero, and every pose can still turn freely without cropping
const FILL = 0.8

function sphereRadius(box, center) {
  const corner = new THREE.Vector3()
  let radius = 0
  for (let i = 0; i < 8; i++) {
    corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z)
    radius = Math.max(radius, corner.distanceTo(center))
  }
  return radius
}

// The camera has one writer: this frame controller. Scroll only writes the
// story position; a manual drag only writes its own offsets on top of it.
export function AssemblyModel({ state, story, overlay, reducedMotion, offsetX = 0 }) {
  const gltf = useGLTF(ASSEMBLY_URL)
  const data = useMemo(() => prepareAssembly(gltf), [gltf])
  const byId = useMemo(() => new Map(data.parts.map((p) => [p.id, p])), [data])
  // Framing comes from a bounding sphere, not from the posed silhouette, so
  // a change of angle or distance reads as a real change on screen.
  const sphere = useMemo(() => ({
    assembled: sphereRadius(data.originalBounds, data.center),
    exploded: sphereRadius(data.originalBounds.clone().union(data.explodedBounds), data.center),
  }), [data])
  const drag = useRef()
  const { camera, size } = useThree()
  const rig = useMemo(() => ({
    fitted: false, explode: -1, enter: 1,
    look: new THREE.Vector3(), position: new THREE.Vector3(),
    point: new THREE.Vector3(), corner: new THREE.Vector3(), rotation: new THREE.Quaternion(), box: new THREE.Box3(),
    goal: {}, view: Object.fromEntries(KEYS.map((k) => [k, 0])),
  }), [])

  // First impression: out of depth, turning in from about -15° on Y.
  useLayoutEffect(() => {
    if (reducedMotion) { rig.enter = 0; return }
    rig.enter = 1
    const tween = gsap.to(rig, { enter: 0, duration: 1.9, delay: 0.25, ease: 'power3.out' })
    return () => tween.kill()
  }, [reducedMotion, rig])

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05), s = state.current, view = rig.view

    // The pose is a pure function of the story position; this damping only
    // smooths the step between two scroll events.
    poseAt(story.current.t, reducedMotion, rig.goal)
    const k = !rig.fitted || reducedMotion ? 1 : 1 - Math.exp(-4 * dt)
    for (const key of KEYS) view[key] += (rig.goal[key] - view[key]) * k

    const damping = 1 - Math.pow(0.92, dt * 60)
    s.currentX += (s.targetX - s.currentX) * damping
    s.currentY += (s.targetY - s.currentY) * damping
    drag.current.rotation.set(
      (view.rx + rig.enter * 4) * DEG + s.currentX,
      (view.ry - rig.enter * 15) * DEG + s.currentY,
      view.rz * DEG,
      'YXZ'
    )

    if (Math.abs(view.explode - rig.explode) > 0.0005) {
      rig.explode = view.explode
      applyAssembly(data, view.explode)
    }

    const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const tanX = tanY * size.width / size.height
    // The pose's distance sets the scale; the live silhouette only sets a
    // floor, so a close-up can never crop the valve (pan included).
    const radius = THREE.MathUtils.lerp(sphere.assembled, sphere.exploded, view.explode)
    rig.rotation.copy(drag.current.quaternion).multiply(BASE)
    rig.box.copy(data.originalBounds)
    rig.box.min.lerp(rig.corner.copy(data.originalBounds.min).min(data.explodedBounds.min), view.explode)
    rig.box.max.lerp(rig.corner.copy(data.originalBounds.max).max(data.explodedBounds.max), view.explode)
    // offsetX places the valve within a stage wider than itself (desktop)
    const x = view.x + offsetX
    const roomX = tanX * (0.92 - Math.abs(x)), roomY = tanY * (0.92 - Math.abs(view.y))
    let floor = 0
    for (let i = 0; i < 8; i++) {
      const b = rig.box
      rig.point.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).sub(data.center).applyQuaternion(rig.rotation)
      floor = Math.max(floor, rig.point.z + Math.abs(rig.point.x) / roomX, rig.point.z + Math.abs(rig.point.y) / roomY)
    }
    const z = Math.max(radius / Math.min(tanX, tanY) * FILL * view.dist, floor) * (1 + rig.enter * 0.3)
    // x / y move the valve on screen by a share of the half-stage
    const panX = -x * z * tanX
    const panY = -view.y * z * tanY
    rig.position.set(panX, panY, z)
    if (!rig.fitted) {
      camera.position.copy(rig.position); rig.look.set(panX, panY, 0); rig.fitted = true
    } else {
      camera.position.lerp(rig.position, 1 - Math.exp(-10 * dt))
      rig.look.lerp(P.set(panX, panY, 0), 1 - Math.exp(-10 * dt))
    }
    camera.lookAt(rig.look)
    camera.updateMatrixWorld()
    data.scene.updateWorldMatrix(true, true)

    drawOverlay(overlay.current, { data, byId, camera, size, view })
  })

  return <group ref={drag} name="dragRotationGroup"><group quaternion={BASE} name="assemblyRoot"><group position={data.center.clone().negate()}><primitive object={data.scene} /></group></group></group>
}
