import React from 'react'
import THREE from 'three'
import ThreeBSPFactory from 'three-csg'
const ThreeBSP = ThreeBSPFactory(THREE)
import Clipper from 'jsclipper'


let laserKerf = 0.22
let defaults = {
  kerf: laserKerf,
  materialWidth: 3,
  angle: 270,
  width: 120,
  height: 30,
  links: 10,
  linkLengthPercentage: 0.9
}


const PI = Math.PI


function buildRectangle(width, height) {
  let box = new THREE.Shape()
  box.moveTo(0, 0)
  box.lineTo(width, 0)
  box.lineTo(width, height)
  box.lineTo(0, height)
  box.lineTo(0, 0)
  return box.makeGeometry()
}


function buildLineFromOrigin(x, y) {
  let line = new THREE.Geometry()
  line.vertices.push(new THREE.Vector3(0, 0, 0))
  line.vertices.push(new THREE.Vector3(x, y, 0))
  return line
}


function buildMesh(geometry) {
  return new THREE.Mesh(geometry)
}

function getWorldVertices(mesh) {
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

function getLocalVertices(mesh) {
  return mesh
    .geometry
    .vertices
    .map(vertex => vertex.clone())
    .map(vertex => {
      vertex.applyMatrix4(mesh.matrix)
      return vertex
    })
}


function wrapIntoTHREE(paths) {
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


function meshToPolygon(mesh) {
  mesh.updateMatrix()
  const vertices = getLocalVertices(mesh)
  return geometryToPolygon({ vertices })
}


function polygonToMesh(polygon) {
  return buildMesh(polygonToGeometry(polygon))
}


function geometryToPolygon(geometry) {
  let vertices = geometry
    .vertices
    .map(vertex => [vertex.x, vertex.y])
  return new Clipper.Polygon(vertices)
}


function polygonToGeometry(polygon) {
  let vertices = polygon
    .getShape()
    .map(vertex => new THREE.Vector2(vertex[0], vertex[1]))
  return new THREE.Shape(vertices).makeGeometry()
}


function unionMeshes(meshes) {
  const polygons = meshes.map(meshToPolygon)
  const children = meshes.map(m => {
    const parent = new THREE.Object3D()
    parent.applyMatrix(m.matrix)

    if (m.children.length > 0) {
      parent.add.apply(parent, m.children)
    }

    return parent
  })
  const unions = polygons[0].unionMultiple(polygons.slice(1)).map(polygonToMesh)

  const result = new THREE.Object3D()
  unions.forEach(union => result.add(union))
  children.forEach(child => result.add(child))

  return result
}


function degreeToRadians(degree) {
  return degree / 180 * PI
}


function computeMinimumLinkCount(configs) {
  let radians = degreeToRadians(configs.angle)
  let piQuarter = PI / 4
  let w = configs.materialWidth
  let wSqr = w * w
  let cosFactor = Math.acos((configs.kerf + w) / (2 * Math.sqrt(wSqr / 2)))

  return radians / (piQuarter - cosFactor)
}


function widthFromRadius(radius) {
  return 2 * radius * PI
}


function buildConfig(config) {
  if (config.radius) {
    config.width = widthFromRadius(config.radius)
  }

  return Object.assign({}, defaults, config)
}

//
// Builder
//

class Cut {
  constructor(config, index, horizontalOffset) {
    this.config = config
    this.index = index
    this.horizontalOffset = horizontalOffset
    this.cutTemplate = this.buildCut()
  }

  getWidth() {
    return this.cutTemplate.kerf
  }

  static getWidth(config) {
    return config.kerf <= laserKerf ? laserKerf : config.kerf
  }

  buildCut() {
    if (this.config.kerf <= laserKerf)
      return {
        kerf: laserKerf,
        link: buildMesh(buildLineFromOrigin(0, this.config.height * this.config.linkLengthPercentage))
      }
    else
      return {
        kerf: this.config.kerf,
        link: buildMesh(buildRectangle(this.config.kerf, this.config.height * this.config.linkLengthPercentage))
      }
  }

  buildEvenCut() {
    return this.cutTemplate
      .link
      .clone()
      .translateY(this.config.height * (1 - this.config.linkLengthPercentage) * 0.5)
  }

  buildOddCut() {
    let { kerf, link } = this.cutTemplate

    let gapCutTop = link.clone()
    gapCutTop.scale.y = 0.5

    let gapCutBottom = link
      .clone()
      .translateY(this.config.height - this.config.height * 0.5 * this.config.linkLengthPercentage)
    gapCutBottom.scale.y = 0.5

    let object = new THREE.Object3D()
    object.add(gapCutTop)
    object.add(gapCutBottom)
    return object
  }

  build() {
    const cut = this.index % 2 == 0 ? this.buildEvenCut() : this.buildOddCut()
    return cut.translateX(this.horizontalOffset)
  }


  /*
  # A link is essentially the gap between to cuts.
  # The cut outline is defined by the kerf.
  # It looks like this:
  # ------------------
  # xxx|lllxxxxxxxxxxx
  # xxx|lllxxxxxxxxxxx
  # xxx|lll|xxxxxxxxxx
  # xxxxlll|xxxxxxxxxx
  # xxxxlll|xxxxxxxxxx
  # xxx|lll|xxxxxxxxxx
  # xxx|lllxxxxxxxxxxx
  # xxx|lllxxxxxxxxxxx
  # ------------------
  #
  # Place cut pairs distributed so they form links.
  */
  static generator(config) {
    return function*(linkCount) {
      // a cut pair has width of two cuts plus the gap
      let kerf = Cut.getWidth(config)
      let totalCutWidth = (linkCount + 1) * kerf + linkCount * config.materialWidth

      // place all links centered
      let linkCenterShift = - totalCutWidth / 2
      let braceletCenterShift = config.width / 2

      // place linkCount-many cuts and an additional border
      let x = linkCenterShift + braceletCenterShift
      for (var i = 0; i < linkCount; i++) {
        let cut = new Cut(config, i, x)
        yield cut.build()
        x += config.materialWidth + cut.getWidth()
      }
    }
  }
}

class Hook {
  constructor(config) {
    this.config = config
  }

  static buildHook(config) {
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

  static generator(config) {
    return function*() {
      const hookTemplate = Hook.buildHook(config)
      const scale = 30
      const zAxis = new THREE.Vector3(0, 0, 1)

      const buildLeftHook = () => {
        const leftHook = hookTemplate.clone()
        leftHook.scale.multiplyScalar(scale)
        leftHook.rotateOnAxis(zAxis, Math.PI / 2)
        return leftHook
      }

      const left = new THREE.Object3D()
      left.add(buildLeftHook())
      left.translateY(config.height / 2)
      left.translateX(scale / 2 + 4) // HACKY: remove + 4
      left.updateMatrixWorld()
      const verticesL = getWorldVertices(left.children[0])
      const geoL = new THREE.Geometry()
      geoL.vertices = verticesL
      yield buildMesh(geoL)

      const buildRightHook = () => {
        const rightHook = hookTemplate.clone()
        rightHook.scale.multiplyScalar(scale)
        rightHook.rotateOnAxis(zAxis, -Math.PI / 2)
        return rightHook
      }

      const right = new THREE.Object3D()
      right.add(buildRightHook())
      right.translateY(config.height / 2)
      right.translateX(config.width + 1.5 * scale - 4)
      right.updateMatrixWorld()
      const verticesR = getWorldVertices(right.children[0])
      const geoR = new THREE.Geometry()
      geoR.vertices = verticesR
      yield buildMesh(geoR)
    }
  }
}


class Builder {
  constructor(config, linkGenerator, closureGenerator) {
    if (config.kerf < laserKerf) {
      config.kerf = laserKerf
      console.warn('You selected a kerf smaller than the default laser kerf!')
    }

    this.config = buildConfig(config)
    this.linkGenerator = linkGenerator(this.config)
    this.closureGenerator = closureGenerator(this.config)
  }


  buildOutline() {
    return buildMesh(
      buildRectangle(this.config.width, this.config.height)
    ).translateX(30)
  }

  getWidth() {
    return this.config.width + 60
  }

  /*
  # Equally distribute the links according to material width
  # as this results in best tradeoff for stability and flexibility
  */
  buildLinks(linkCount) {
    return Array.from(this.linkGenerator(linkCount))
  }

  buildClosure() {
    return Array.from(this.closureGenerator())
  }

  buildPaths() {
    // nest links into outline
    const outline = this.buildOutline()
    const links = this.buildLinks(this.config.links)
    links.forEach(link => outline.add(link))

    // concat to all paths to a list
    return [ outline ].concat(this.buildClosure())
  }


  build() {
    return unionMeshes(this.buildPaths())
  }
}

export default class BraceletBuilder extends Builder {
  constructor(config) {
    super(config, Cut.generator, Hook.generator)
  }
}
