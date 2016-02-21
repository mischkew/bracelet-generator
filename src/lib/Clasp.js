import THREE from 'three'
import { AXES,
         buildMesh,
         getWorldVertices,
         moveChildrenToObject } from './three-helpers'


// TODO: why hardcoded scale?
const SCALE = 30

// TODO: load hook forms from svg shapes
export default class Clasp {
  constructor(config) {
    this.config = config
  }

  buildHook() {
    throw new Error('Subclass Responsibility')
  }

  buildLeftHook() {
    const leftHook = this.buildHook()
    leftHook.rotateOnAxis(AXES.Z, Math.PI / 2)
    return leftHook
  }

  buildRightHook() {
    const rightHook = this.buildHook()
    rightHook.rotateOnAxis(AXES.Z, -Math.PI / 2)
    return rightHook
  }

  makeGenerator() {
    return () => {
      // LEFT HOOK
      const leftHook = this.buildLeftHook()
      leftHook.scale.multiplyScalar(SCALE)

      const left = new THREE.Object3D()
      left.add(leftHook)
      left.translateY(this.config.height / 2)
      left.translateX(SCALE / 2 + 4) // HACKY: remove + 4


      // RIGHT HOOK
      const rightHook = this.buildRightHook()
      rightHook.scale.multiplyScalar(SCALE)

      const right = new THREE.Object3D()
      right.add(rightHook)
      right.translateY(this.config.height / 2)
      right.translateX(this.config.width + 1.5 * SCALE - 4)

      return [left, right]
    }
  }
}
