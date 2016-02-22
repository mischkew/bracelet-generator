import THREE from 'three'
import { buildMesh, getWorldVertices } from '../../../lib/three-helpers'
import Clasp from './Clasp'


export default class HookClasp extends Clasp {
  buildHook() {
    const hook = new THREE.Shape()
    hook.moveTo(0,0)
    hook.bezierCurveTo(
      0, 1,
      1, 1,
      1, 0.3
    )
    hook.lineTo(0.8, 0.3)
    hook.bezierCurveTo(0.8, 0.7, 0.2, 0.7, 0.2, 0)

    const geometry = hook.makeGeometry()
    geometry.center()
    return buildMesh(geometry)
  }
}
