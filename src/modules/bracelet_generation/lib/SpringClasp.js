import THREE from 'three'
import { buildMesh, getWorldVertices, buildRectangle } from './three-helpers'
import Clasp from './Clasp'


export default class SpringClasp extends Clasp {
  buildLeftHook() {
    const rect = buildRectangle(1, 0.6)
    const mesh = buildMesh(rect)
    mesh.geometry.center()
    return mesh
  }

  buildRightHook() {
    const inner = buildMesh(buildRectangle(0.3, 0.7))
    inner.geometry.center()

    const outer = buildMesh(buildRectangle(0.8, 1))
    outer.geometry.center()
    outer.add(inner) // inner is centered in outer

    return outer
  }
}
