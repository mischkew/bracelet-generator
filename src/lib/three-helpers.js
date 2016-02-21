import THREE from 'three'

export const AXES = {
  X: new THREE.Vector3(1,0,0),
  Y: new THREE.Vector3(0,1,0),
  Z: new THREE.Vector3(0,0,1)
}

export function rotateAroundCenter(object, axis, radians) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.center()
  const distance = center.length()
  const centerNormalized = center.normalize()

  // move object to origin
  object.translateOnAxis(
    centerNormalized.clone().multiplyScalar(-1),
    distance
  )

  // then rotate
  object.rotateOnAxis(axis, radians)

  // ... and move back
  object.translateOnAxis(
    centerNormalized,
    distance
  )
}

export function buildRectangle(width, height) {
  let box = new THREE.Shape()
  box.moveTo(0, 0)
  box.lineTo(width, 0)
  box.lineTo(width, height)
  box.lineTo(0, height)
  box.lineTo(0, 0)
  return box.makeGeometry()
}


export function buildLineFromOrigin(x, y) {
  let line = new THREE.Geometry()
  line.vertices.push(new THREE.Vector3(0, 0, 0))
  line.vertices.push(new THREE.Vector3(x, y, 0))
  return line
}


export function buildMesh(geometry) {
  return new THREE.Mesh(geometry)
}


// TODO: use localToWorld
export function getWorldVertices(mesh) {
  return mesh
    .geometry
    .vertices
    .map(vertex => vertex.clone())
    .map(vertex => {
      vertex.applyMatrix4(mesh.matrix)
      mesh.traverseAncestors(object => vertex.applyMatrix4(object.matrix))
      return vertex
    })
}

// TODO: use world to local
export function getLocalVertices(mesh) {
  return mesh
    .geometry
    .vertices
    .map(vertex => vertex.clone())
    .map(vertex => {
      vertex.applyMatrix4(mesh.matrix)
      return vertex
    })
}


export function wrapIntoTHREE(paths) {
  return paths
    .map(obj => {
      obj.updateMatrixWorld(true)
      return obj
    })
    .reduce((parent, obj) => {
      parent.add(obj)
      return parent
    }, new THREE.Object3D())
}


// TODO: describe limitations of this approach
export function moveChildrenToObject(mesh) {
  const parent = new THREE.Object3D()
  parent.applyMatrix(mesh.matrixWorld)

  if (mesh.children.length > 0) {
    parent.add.apply(parent, mesh.children)
  }

  return parent
}
