import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * A local, procedural studio — no HDRI file to ship. RoomEnvironment gives the
 * metal something coherent to reflect; the three directionals carve the product
 * shot on top of it. Tuned bright, to match a light architectural page rather
 * than a dark showroom.
 */
export function Lighting({ intensity = 1.05 }) {
  const { gl, scene } = useThree()

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const target = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = target.texture
    scene.environmentIntensity = intensity
    return () => {
      scene.environment = null
      target.dispose()
      pmrem.dispose()
    }
  }, [gl, scene, intensity])

  return (
    <>
      {/* key — soft, high, camera-left */}
      <directionalLight position={[-2.6, 4.2, 3.4]} intensity={1.6} color="#ffffff" />
      {/* rim — cuts the dark metal away from the off-white page */}
      <directionalLight position={[4.2, 1.8, -2.6]} intensity={1.9} color="#eef3f8" />
      {/* fill — keeps the underside from collapsing to a silhouette */}
      <directionalLight position={[0.6, -2.4, 2.4]} intensity={0.7} color="#dfe6ec" />
    </>
  )
}
