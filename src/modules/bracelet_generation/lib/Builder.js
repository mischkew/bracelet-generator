import { buildMesh, buildRectangle } from '../../../lib/three-helpers'
import { unionOuterMeshes } from './clip-helpers'
import { LASER_KERF, DEFAULTS } from '../../../defaults'


const PI = Math.PI


function buildConfig(config) {
  if (config.radius) {
    config.width = widthFromRadius(config.radius)
  }

  return Object.assign({}, DEFAULTS, config)
}


function degreeToRadians(degree) {
  return degree / 180 * PI
}


function computeMinimumLinkCount(configs) {
  let radians = degreeToRadians(configs.angle)
  let piQuarter = PI / 4
  let w = configs.materialThickness
  let wSqr = w * w
  let cosFactor = Math.acos((configs.kerf + w) / (2 * Math.sqrt(wSqr / 2)))

  return radians / (piQuarter - cosFactor)
}


function widthFromRadius(radius) {
  return 2 * radius * PI
}


export default class Builder {
  constructor(config, CutClass, ClaspClass) {
    if (config.kerf < LASER_KERF) {
      config.kerf = LASER_KERF
      console.warn('You selected a kerf smaller than the default laser kerf!')
    }

    this.config = buildConfig(config)
    this.cut = CutClass
    this.linkGenerator = this.cut.generator(this.config)

    this.clasp = new ClaspClass(this.config)
    const totalWidth = this.cut.getTotalWidth(this.config)
    if (this.config.width < totalWidth) {
      this.config.width = totalWidth + 2 * this.config.materialThickness
      console.warn('You need more space to place all required links. Auto-resized the bracelet width.')
    }

    this.closureGenerator = this.clasp.makeGenerator()
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
