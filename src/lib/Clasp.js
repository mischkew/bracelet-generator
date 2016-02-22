import THREE from 'three'
import { AXES,
         buildMesh,
         getWorldVertices,
         moveChildrenToObject } from './three-helpers'

const DEFAULT_UNION_INSET = 3

// TODO: load hook forms from svg shapes
export default class Clasp {
  constructor(config) {
    this.config = config
  }

  /**
   * Total width and height of each clasp, given as a THREE.Vector3 on x and y coordinates.
   * @returns {THREE.Vector3}
   */
  scale() {
    return new THREE.Vector3(30, 30, 1)
  }

  buildHook() {
    throw new Error('Subclass Responsibility')
  }

  /**
   * Returns an Object3D visualizing the left hook of the clasp
   * which contains a centered geometry.
   */
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
      const SCALE = this.scale()
      const UNION_INSET = Math.max(0.01 * SCALE.x, DEFAULT_UNION_INSET)

      // LEFT HOOK
      const leftHook = this.buildLeftHook()
      leftHook.scale.multiply(SCALE)

      const left = new THREE.Object3D()
      left.add(leftHook)
      left.translateY(this.config.height / 2)
      left.translateX(SCALE.x / 2 + UNION_INSET)


      // RIGHT HOOK
      const rightHook = this.buildRightHook()
      rightHook.scale.multiply(SCALE)

      const right = new THREE.Object3D()
      right.add(rightHook)
      right.translateY(this.config.height / 2)
      right.translateX(this.config.width + 1.5 * SCALE.x - UNION_INSET)

      return [left, right]
    }
  }
}
