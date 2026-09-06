import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '../lib/motion'
import { ASSEMBLY_URL, applyAssembly, prepareAssembly, partWorldBounds } from './assemblyParts'

const BASE = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.28, -0.38, -0.12, 'YXZ'))
const easeOut = t => 1 - Math.pow(1 - THREE.MathUtils.clamp(t, 0, 1), 4)
const UP = new THREE.Vector3(0, 1, 0)

// The camera has one writer: this frame controller. GSAP only animates the
// entrance group and the independent normalized assembly progress.
export function AssemblyModel({ state, api, route, onReady, reducedMotion, tier }) {
  const gltf = useGLTF(ASSEMBLY_URL)
  const data = useMemo(() => prepareAssembly(gltf), [gltf])
  const entrance = useRef(), scroll = useRef(), drag = useRef()
  const { camera, size } = useThree()
  const rig = useMemo(() => ({
    revision: -1, elapsed: 2, duration: 1.15, warm: 0, transitioning: false,
    look: new THREE.Vector3(), fromLook: new THREE.Vector3(), fromPosition: new THREE.Vector3(),
    position: new THREE.Vector3(), target: new THREE.Vector3(), direction: new THREE.Vector3(),
    right: new THREE.Vector3(), up: new THREE.Vector3(), point: new THREE.Vector3(), color: new THREE.Color(),
    rotation: new THREE.Quaternion(), box: new THREE.Box3(),
    raycaster: new THREE.Raycaster(), pointer: new THREE.Vector2(),
  }), [])

  useLayoutEffect(() => {
    api.current = {
      pick(clientX, clientY, rect) {
        if (state.current.explodeProgress < 0.98) return null
        rig.pointer.set((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1)
        rig.raycaster.setFromCamera(rig.pointer, camera)
        data.scene.traverse(mesh => { if (mesh.isSkinnedMesh) { mesh.skeleton.update(); mesh.computeBoundingBox(); mesh.computeBoundingSphere() } })
        return rig.raycaster.intersectObject(data.scene, true)[0]?.object.userData.partId || null
      }, data,
    }
    onReady()
    const ctx = gsap.context(() => {
      if (reducedMotion) return
      gsap.fromTo(entrance.current.scale, { x: 0.94, y: 0.94, z: 0.94 }, { x: 1, y: 1, z: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' })
      gsap.fromTo(entrance.current.position, { z: -0.6 }, { z: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' })
    })
    return () => { ctx.revert(); api.current = null }
  }, [api, camera, data, onReady, reducedMotion, rig, state])

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05), s = state.current
    const damping = 1 - Math.pow(0.92, dt * 60)
    s.currentX += (s.targetX - s.currentX) * damping
    s.currentY += (s.targetY - s.currentY) * damping
    drag.current.rotation.set(s.currentX, s.currentY, 0, 'YXZ')
    scroll.current.position.set(s.exit * 0.7, s.exit * 0.7, 0)
    scroll.current.scale.setScalar(1 - s.exit * 0.07)

    if (rig.revision !== s.focusRevision) {
      rig.revision = s.focusRevision
      rig.transitioning = true
      rig.fromPosition.copy(camera.position); rig.fromLook.copy(rig.look)
      rig.elapsed = 0; rig.duration = reducedMotion ? 0.18 : s.selected ? 1.15 : 1
      data.parts.forEach(p => { p.pullFrom = p.pull })
    }
    // Choreography uses elapsed wall time, including slow GPU frames; damping
    // alone uses a bounded step so low frame rates cannot stretch a 1.15s move.
    rig.elapsed += rawDelta
    const t = Math.min(1, rig.elapsed / rig.duration)
    const selected = data.parts.find(p => p.id === s.selected)
    data.parts.forEach(p => {
      // Old part returns first; the next begins separating after 140ms.
      const chosen = p === selected && s.explodeProgress > 0.98
      const u = chosen ? easeOut((t - 0.12) / 0.65) : easeOut(t / 0.28)
      p.pull = THREE.MathUtils.lerp(p.pullFrom, chosen ? 1 : 0, u)
    })
    applyAssembly(data, s.explodeProgress)
    data.scene.updateWorldMatrix(true, true)

    data.materials.forEach(m => {
      const chosen = m.partId === s.selected, hovered = m.partId === s.hovered
      const related = selected && data.parts.find(p => p.id === m.partId)?.center.distanceTo(selected.center) < data.span * 0.32
      const emphasis = !selected || chosen ? 1 : related ? 0.44 : 0.23
      m.material.opacity = THREE.MathUtils.damp(m.material.opacity, m.opacity * emphasis, reducedMotion ? 30 : 7, rawDelta)
      m.material.depthWrite = m.material.opacity > 0.95
      m.mesh.renderOrder = chosen ? 2 : 0
      const brightness = chosen ? 1.07 : hovered ? 1.04 : selected ? 0.8 : 1
      m.material.color.lerp(rig.color.copy(m.color).multiplyScalar(brightness), damping)
      m.material.emissive.copy(m.emissive)
      m.material.envMapIntensity = THREE.MathUtils.damp(m.material.envMapIntensity, m.intensity * (chosen ? 1.08 : 1), 8, dt)
    })

    const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const tanX = tanY * size.width / size.height
    let distance = 0
    if (selected) {
      // Actual skin-aware bounds in the live drag hierarchy; no part-specific
      // camera coordinates. Final pull is included to keep the framing stable.
      partWorldBounds(data, selected, s.explodeProgress, 1, rig.box)
      rig.box.getCenter(rig.target)
      rig.direction.set(...selected.axis).transformDirection(data.scene.parent.matrixWorld).multiplyScalar(0.42)
      rig.direction.z += 1
      rig.direction.normalize()
      rig.right.crossVectors(UP, rig.direction).normalize()
      rig.up.crossVectors(rig.direction, rig.right).normalize()
      const fill = tier === 'mobile' ? 0.64 : tier === 'tablet' ? 0.48 : 0.53
      for (let i = 0; i < 8; i++) {
        const b = rig.box
        rig.point.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).sub(rig.target)
        distance = Math.max(distance, rig.point.dot(rig.direction) + Math.abs(rig.point.dot(rig.right)) / (tanX * fill), rig.point.dot(rig.direction) + Math.abs(rig.point.dot(rig.up)) / (tanY * fill))
      }
      const settle = reducedMotion ? 0 : Math.sin(Math.PI * THREE.MathUtils.clamp((t - 0.65) / 0.35, 0, 1)) * 0.01
      rig.position.copy(rig.target).addScaledVector(rig.direction, distance * (1 - settle))
    } else {
      rig.rotation.copy(drag.current.quaternion).multiply(BASE)
      rig.box.copy(data.originalBounds).union(data.explodedBounds)
      for (let i = 0; i < 8; i++) {
        const b = rig.box
        rig.point.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).sub(data.center).applyQuaternion(rig.rotation)
        distance = Math.max(distance, rig.point.z + Math.abs(rig.point.x) / (tanX * 0.9), rig.point.z + Math.abs(rig.point.y) / (tanY * 0.9))
      }
      rig.warm = THREE.MathUtils.damp(rig.warm, s.inspection ? 1 : 0, 8, dt)
      rig.target.set(0, 0, 0)
      rig.position.set(0, 0, distance * (1 + 0.08 * s.explodeProgress) * (1 - rig.warm * 0.035))
    }

    if (!s.fitted) {
      camera.position.copy(rig.position); rig.look.copy(rig.target); s.fitted = true
      rig.fromPosition.copy(camera.position); rig.fromLook.copy(rig.look)
    } else if (rig.transitioning) {
      const u = easeOut(t)
      camera.position.lerpVectors(rig.fromPosition, rig.position, u)
      if (!reducedMotion) camera.position.z += Math.sin(Math.PI * t) * distance * 0.035
      rig.look.lerpVectors(rig.fromLook, rig.target, u)
      if (t === 1) rig.transitioning = false
    } else {
      camera.position.lerp(rig.position, 1 - Math.exp(-10 * dt))
      rig.look.lerp(rig.target, 1 - Math.exp(-10 * dt))
    }
    camera.lookAt(rig.look)
    camera.updateMatrixWorld()

    // Route stops in the margin outside the focused silhouette.
    if (route.current && selected) {
      rig.box.getCenter(rig.point).project(camera)
      const x = THREE.MathUtils.clamp((rig.point.x + 1) * size.width / 2, size.width * 0.3, size.width * 0.7)
      const y = THREE.MathUtils.clamp((1 - rig.point.y) * size.height / 2, size.height * 0.25, size.height * 0.7)
      route.current.setAttribute('d', `M 18 ${size.height * 0.78} H ${Math.max(30, x - size.width * 0.32)} V ${y} h ${size.width * 0.055}`)
    }
  })

  return <group ref={entrance} name="heroEntranceGroup"><group ref={scroll} name="heroScrollGroup"><group ref={drag} name="dragRotationGroup"><group quaternion={BASE} name="assemblyRoot"><group position={data.center.clone().negate()}><primitive object={data.scene} /></group></group></group></group></group>
}
