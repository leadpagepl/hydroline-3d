import * as THREE from 'three'

export const ASSEMBLY_URL = '/models/bateria-tefal.glb'

// Verified against the GLB skin, mesh bounds and authored assembly axes.
// Node IDs are retained because two exported bone names contain damaged accents.
export const PARTS = [
  { id: 'head', label: 'Głowica', description: 'Ustawiasz nią temperaturę grzejnika.', nodes: [13, 18], meshes: ['Object_21','Object_23','Object_25','Object_27','Object_29'], axis: [-1,0,0], distance: 4, range: [0.05,0.55] },
  { id: 'cap', label: 'Osłona zaworu', description: 'Osłania śrubę, którą zamyka się zawór.', nodes: [12], meshes: ['Object_41'], axis: [1,0,0], distance: 2.8, range: [0.12,0.62] },
  { id: 'nut-left', label: 'Nakrętka przyłącza', description: 'Dociska połączenie z rurą.', nodes: [17], meshes: ['Object_39'], axis: [0,0,1], distance: 5.5, range: [0.12,0.62] },
  { id: 'nut-right', label: 'Nakrętka przyłącza', description: 'Dociska połączenie z drugą rurą.', nodes: [9], meshes: ['Object_49'], axis: [0,0,1], distance: 5.5, range: [0.16,0.66] },
  { id: 'adapter-left', label: 'Adapter do rury', description: 'Łączy rurę miedzianą z zaworem.', nodes: [16], meshes: ['Object_37'], axis: [0,0,1], distance: 2.7, range: [0.20,0.72] },
  { id: 'adapter-right', label: 'Adapter do rury', description: 'Łączy drugą rurę z zaworem.', nodes: [8], meshes: ['Object_51'], axis: [0,0,1], distance: 2.7, range: [0.24,0.76] },
  { id: 'union-left', label: 'Nakrętka śrubunku', description: 'Trzyma połączenie z grzejnikiem.', nodes: [14], meshes: ['Object_31'], axis: [0,1,0], distance: 2, range: [0.20,0.72] },
  { id: 'union-right', label: 'Nakrętka śrubunku', description: 'Trzyma drugie połączenie z grzejnikiem.', nodes: [10], meshes: ['Object_47'], axis: [0,1,0], distance: 2, range: [0.24,0.76] },
  { id: 'connector-left', label: 'Przyłącze grzejnika', description: 'Tę część wkręca się w grzejnik.', nodes: [15], meshes: ['Object_33','Object_35'], axis: [0,1,0], distance: 4.5, range: [0.28,0.80] },
  { id: 'connector-right', label: 'Przyłącze grzejnika', description: 'Łączy zawór z drugim otworem grzejnika.', nodes: [11], meshes: ['Object_43','Object_45'], axis: [0,1,0], distance: 4.5, range: [0.32,0.84] },
]

const prepared = new WeakMap()
const smooth = (x) => x * x * (3 - 2 * x)

export function prepareAssembly(gltf) {
  if (prepared.has(gltf.scene)) return prepared.get(gltf.scene)
  const scene = gltf.scene
  scene.updateMatrixWorld(true)
  const byIndex = new Map()
  scene.traverse(object => {
    const association = gltf.parser.associations.get(object)
    if (association?.nodes !== undefined) byIndex.set(association.nodes, object)
  })
  const materials = []
  const parts = PARTS.map(config => {
    const axis = new THREE.Vector3(...config.axis)
    const nodes = config.nodes.map(index => {
      const object = byIndex.get(index)
      if (!object) throw new Error(`Missing assembly node ${index}`)
      // Convert a world assembly axis to the authored bone parent's local frame.
      const localAxis = axis.clone().applyMatrix3(new THREE.Matrix3().setFromMatrix4(object.parent.matrixWorld).invert())
      return { object, position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone(), localAxis }
    })
    const meshes = config.meshes.map(name => scene.getObjectByName(name))
    meshes.forEach(mesh => { if (!mesh) throw new Error(`Missing part mesh ${config.id}`); mesh.userData.partId = config.id })
    return { ...config, nodes, meshes, pull: 0, pullFrom: 0 }
  })
  scene.traverse(object => {
    if (!object.isMesh) return
    // The GLB exports the head's logo and scale as two separate black meshes.
    // Hide only that printed geometry; retain the authored chrome and textures.
    if (object.material.name === 'logo_oraz_skala') {
      object.visible = false
      object.raycast = () => {}
    }
    object.frustumCulled = false
    // Per-mesh copies retain textures/metal/roughness while allowing local emphasis.
    object.material = object.material.clone()
    object.material.transparent = true
    materials.push({ mesh: object, material: object.material, partId: object.userData.partId, color: object.material.color.clone(), emissive: object.material.emissive.clone(), intensity: object.material.envMapIntensity, opacity: object.material.opacity })
  })
  const bounds = () => {
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3()
    scene.traverse(mesh => {
      if (!mesh.isMesh) return
      if (mesh.isSkinnedMesh) { mesh.skeleton.update(); mesh.computeBoundingBox() }
      else mesh.geometry.computeBoundingBox()
      box.union((mesh.boundingBox || mesh.geometry.boundingBox).clone().applyMatrix4(mesh.matrixWorld))
    })
    return box
  }
  const originalBounds = bounds()
  // Skin-aware bind bounds are measured once. Every mapped component translates
  // rigidly along its verified axis, so its live bounds need no per-frame skin scan.
  parts.forEach(part => {
    part.bounds = new THREE.Box3()
    part.meshes.forEach(mesh => part.bounds.union(mesh.boundingBox.clone().applyMatrix4(mesh.matrixWorld)))
    part.center = part.bounds.getCenter(new THREE.Vector3())
  })
  const span = originalBounds.getSize(new THREE.Vector3()).length()
  const data = { scene, parts, materials, span, pullDistance: span * 0.085 }
  applyAssembly(data, 1)
  const explodedBounds = bounds().expandByScalar(data.pullDistance)
  applyAssembly(data, 0)
  Object.assign(data, { originalBounds, explodedBounds, center: originalBounds.clone().union(explodedBounds).getCenter(new THREE.Vector3()) })
  prepared.set(scene, data)
  return data
}

export function partWorldBounds(data, part, progress, pull, target) {
  const t = smooth(THREE.MathUtils.clamp((progress - part.range[0]) / (part.range[1] - part.range[0]), 0, 1))
  target.copy(part.bounds)
  const distance = part.distance * t + pull * data.pullDistance
  for (const key of ['min', 'max']) {
    target[key].x += part.axis[0] * distance
    target[key].y += part.axis[1] * distance
    target[key].z += part.axis[2] * distance
  }
  return target.applyMatrix4(data.scene.parent.matrixWorld)
}

export function applyAssembly(data, progress) {
  for (const part of data.parts) {
    const t = smooth(THREE.MathUtils.clamp((progress - part.range[0]) / (part.range[1] - part.range[0]), 0, 1))
    for (const node of part.nodes) {
      node.object.position.copy(node.position).addScaledVector(node.localAxis, part.distance * t + part.pull * data.pullDistance)
      node.object.quaternion.copy(node.quaternion)
      node.object.scale.copy(node.scale)
    }
  }
}
