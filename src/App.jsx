import React, { Component } from 'react'
import Zipper from './lib/Zipper'
import { rotateAroundCenter, AXES } from './lib/three-helpers.js'
import BraceletBuilder from './lib/BraceletBuilder'
import { SVGRenderer } from './components/SVGRenderer'

// all dimensions are given in mm
const VERSION1 = {
  width: 0, // now width is only determined by link count
  links: 50,
  kerf: 0,
  materialThickness: 3,
  linkGap: 2,
  linkLengthPercentage: 0.75
}

const VERSION2 = {
  width: 0, // now width is only determined by link count
  links: 60,
  kerf: 0,
  materialThickness: 3,
  linkGap: 1.5,
  linkLengthPercentage: 0.8
}

let builder = new BraceletBuilder(VERSION2)

let threeObject = builder.build()
// TODO: fix rotation
// rotateAroundCenter(threeObject, AXES.Z, Math.PI / 2)

let svgElement = <SVGRenderer
  isFile={true}
  width={builder.getWidth()}
  height={builder.config.height}
  config={builder.config}
  threeObject={threeObject} />
let url = Zipper.getUrl(svgElement)


export default class App extends Component {
  render() {
    return (
      <div>
        <a href={url}>{url}</a>
        <br />
        <SVGRenderer
          config={builder.config}
          width={builder.getWidth()}
          height={builder.config.height}
          threeObject={threeObject} />
      </div>
    )
  }
}
