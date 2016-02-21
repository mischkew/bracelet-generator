import { buildMesh, buildRectangle } from './three-helpers'
import { unionOuterMeshes } from './clip-helpers'
import { LASER_KERF, DEFAULTS } from '../defaults'


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
  let w = configs.materialWidth
  let wSqr = w * w
  let cosFactor = Math.acos((configs.kerf + w) / (2 * Math.sqrt(wSqr / 2)))

  return radians / (piQuarter - cosFactor)
}


function widthFromRadius(radius) {
  return 2 * radius * PI
}


export default class Builder {
  constructor(config, linkGenerator, ClaspClass) {
    if (config.kerf < LASER_KERF) {
      config.kerf = LASER_KERF
      console.warn('You selected a kerf smaller than the default laser kerf!')
    }

    this.config = buildConfig(config)
    this.linkGenerator = linkGenerator(this.config)
    this.closureGenerator = new ClaspClass(this.config).makeGenerator()
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

  buildClasps() {
    return Array.from(this.closureGenerator())
  }

  buildPaths() {
    // nest links into outline
    const outline = this.buildOutline()
    const links = this.buildLinks(this.config.links)
    links.forEach(link => outline.add(link))

    // concat all paths to a list
    return [ outline ].concat(this.buildClasps())
  }

  build() {
    return unionOuterMeshes(this.buildPaths())
  }
}
