import THREE from 'three'
import { buildMesh, getWorldVertices, buildRectangle } from './three-helpers'
import Clasp from './Clasp'


export default class ClickClasp extends Clasp {
  constructor(config) {
    if (!config.materialThickness) {
      throw new Error('Config does not provide a material thickness!')
    }
    super(...arguments)
  }

  scale() {
    return new THREE.Vector3(3*this.config.materialThickness, this.config.height, 1)
  }

  buildLeftHook() {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0.33, 0)
    shape.lineTo(0.33, 0.1)
    shape.lineTo(1, 0.1)
    shape.lineTo(1, 0.6)
    shape.lineTo(0.33, 0.6)
    shape.lineTo(0.33, 0.7)
    shape.lineTo(0, 0.7)
    shape.lineTo(0, 0)

    const mesh = buildMesh(shape.makeGeometry())
    mesh.geometry.center()

    return mesh
  }

  buildRightHook() {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0.33, 0)
    shape.lineTo(0.33, 0.1)
    shape.lineTo(0.66, 0.1)
    shape.lineTo(0.66, 0.6)
    shape.lineTo(0.33, 0.6)
    shape.lineTo(0.33, 0.7)
    shape.lineTo(0, 0.7)
    shape.lineTo(0, 0)

    const inner = buildMesh(shape.makeGeometry())
    inner.geometry.center()
    inner.translateX(-0.15)

    const outer = buildMesh(buildRectangle(1, 1))
    outer.geometry.center()
    outer.add(inner) // inner is centered in outer

    return outer
  }
}
