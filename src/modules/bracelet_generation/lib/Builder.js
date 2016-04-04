import { buildMesh, buildRectangle } from '../../../lib/three-helpers'
import { unionOuterMeshes } from './clip-helpers'
import { LASER_KERF, DEFAULTS } from '../../../defaults'
import { DEFAULT_UNION_INSET } from './Clasp'


const PI = Math.PI


export function buildConfig(config) {
  if (config.diameter) {
    config.width = widthFromDiameter(config.diameter)
  }

  return Object.assign({}, DEFAULTS, config)
}


export function degreeToRadians(degree) {
  return degree / 180 * PI
}

export function radiansToDegrees(radians) {
  return (radians * 180 * PI)
}

function computeMinimumLinkCount(configs) {
  let radians = degreeToRadians(configs.angle)
  let piQuarter = PI / 4
  let w = configs.materialThickness
  let wSqr = w * w
  let cosFactor = Math.acos((configs.kerf + w) / (2 * Math.sqrt(wSqr / 2)))

  return radians / (piQuarter - cosFactor)
}

export function estimateRadians(configs) {
  let radians = degreeToRadians(configs.angle)
  let piQuarter = PI / 4
  let w = configs.linkGap
  let wSqr = w * w
  let cosFactor = Math.acos((configs.kerf + w) / (2 * Math.sqrt(wSqr / 2)))

  return configs.links * (piQuarter - cosFactor)
}

function widthFromRadius(radius) {
  return 2 * radius * PI
}

function widthFromDiameter(diameter) {
  return diameter * PI
}


export default class Builder {
  constructor(config, CutClass, ClaspClass) {
    if (config.kerf < LASER_KERF) {
      config.kerf = LASER_KERF
      console.warn('You selected a kerf smaller than the default laser kerf!')
    }

    this.config = buildConfig(config)
    this.cut = CutClass
    this.clasp = new ClaspClass(this.config)

    this.constraints = this.buildConstraints(this.config)

    if (this.constraints.moreLinksThanAllowedWidth) {
      this.config.width = this.cut.getTotalWidth(this.config) + 2 * this.config.materialThickness
      console.warn('You need more space to place all required links. Auto-resized the bracelet width.')
    }

    this.linkGenerator = this.cut.generator(this.config)
    this.closureGenerator = this.clasp.makeGenerator()
  }

  buildConstraints() {
    return {
      moreLinksThanAllowedWidth: this.config.width - 2 * DEFAULT_UNION_INSET < this.cut.getTotalWidth(this.config)
    }
  }

  buildOutline() {
    return buildMesh(
      buildRectangle(this.config.width, this.config.height)
    ).translateX(this.clasp.scale().x)
  }

  getWidth() {
    return this.config.width + (2 * this.clasp.scale().x)
  }

  /*
  # Equally distribute the links according to material width
  # as this results in best tradeoff for stability and flexibility
  */
  buildLinks() {
    return Array.from(this.linkGenerator())
  }

  buildClasps() {
    return Array.from(this.closureGenerator())
  }

  buildPaths() {
    // nest links into outline
    const outline = this.buildOutline()
    const links = this.buildLinks()
    links.forEach(link => outline.add(link))

    // concat all paths to a list
    return [ outline ].concat(this.buildClasps())
  }

  build() {
    return unionOuterMeshes(this.buildPaths())
  }
}
