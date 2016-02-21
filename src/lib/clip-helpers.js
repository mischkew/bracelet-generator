import THREE from 'three'
import { buildMesh,
         getWorldVertices,
         moveChildrenToObject } from './three-helpers'
import Clipper from 'jsclipper'


export function meshToPolygon(mesh) {
  // TODO: check if manual update is necessary
  mesh.updateMatrixWorld()
  const vertices = getWorldVertices(mesh)
  return geometryToPolygon({ vertices })
}


export function polygonToMesh(polygon) {
  return buildMesh(polygonToGeometry(polygon))
}


export function geometryToPolygon(geometry) {
  let vertices = geometry
    .vertices
    .map(vertex => [vertex.x, vertex.y])
  return new Clipper.Polygon(vertices)
}


export function polygonToGeometry(polygon) {
  let vertices = polygon
    .getShape()
    .map(vertex => new THREE.Vector2(vertex[0], vertex[1]))
  return new THREE.Shape(vertices).makeGeometry()
}


// TODO: move to three helpers
/**
 * Like THREE.Object3D.traverse but callback must return a boolean,
 * indicating if traversal shall be stopped entirely
 */
function traverse(mesh, callback) {
  if (!callback(mesh)) {
    return false
  }

  const children = mesh.children;
  for (let i = 0, l = children.length; i < l; i++) {
    if (!traverse(children[i], callback)) {
      return false
    }
  }

  return true
}


function findOuterMeshes(meshes) {
  const outerMeshes = []
  meshes.map(mesh => traverse(mesh, m => {
    if (m.geometry) {
      outerMeshes.push(m)
      return false
    }
    return true
  }))
  return outerMeshes
}


export function unionOuterMeshes(meshes) {
  if (meshes.length == 1) {
    console.warn('Cannot union a single mesh.')
    return meshes[0]
  }

  // before union operation, all matrices need an update
  meshes.forEach(m => m.updateMatrixWorld())

  const outerMeshes = findOuterMeshes(meshes)
  const polygons = outerMeshes.map(meshToPolygon)
  const children = outerMeshes.map(moveChildrenToObject)
  const unions = polygons[0].unionMultiple(polygons.slice(1)).map(polygonToMesh)

  const result = new THREE.Object3D()
  unions.forEach(union => result.add(union))
  children.forEach(child => result.add(child))

  return result
}
