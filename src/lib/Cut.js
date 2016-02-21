import THREE from 'three'
import { LASER_KERF } from '../defaults'
import { buildMesh, buildRectangle, buildLineFromOrigin } from './three-helpers'


export default class Cut {
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
    return config.kerf <= LASER_KERF ? LASER_KERF : config.kerf
  }

  buildCut() {
    if (this.config.kerf <= LASER_KERF)
      return {
        kerf: LASER_KERF,
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
