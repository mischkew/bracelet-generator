import THREE from 'three'
import { buildMesh, getWorldVertices, buildRectangle } from './three-helpers'
import Clasp from './Clasp'


export default class ClickClasp extends Clasp {
  buildLeftHook() {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0.2, 0)
    shape.lineTo(0.2, 0.1)
    shape.lineTo(1, 0.1)
    shape.lineTo(1, 0.6)
    shape.lineTo(0.2, 0.6)
    shape.lineTo(0.2, 0.7)
    shape.lineTo(0, 0.7)
    shape.lineTo(0, 0)

    const mesh = buildMesh(shape.makeGeometry())
    mesh.geometry.center()
    return mesh
  }

  buildRightHook() {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0.2, 0)
    shape.lineTo(0.2, 0.1)
    shape.lineTo(0.3, 0.1)
    shape.lineTo(0.3, 0.6)
    shape.lineTo(0.2, 0.6)
    shape.lineTo(0.2, 0.7)
    shape.lineTo(0, 0.7)
    shape.lineTo(0, 0)

    const inner = buildMesh(shape.makeGeometry())
    inner.geometry.center()

    const outer = buildMesh(buildRectangle(0.8, 1))
    outer.geometry.center()
    outer.add(inner) // inner is centered in outer

    return outer
  }
}
