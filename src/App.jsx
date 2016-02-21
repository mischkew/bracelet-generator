import React, { Component } from 'react'
import Zipper from './lib/Zipper'
import { rotateAroundCenter, AXES } from './lib/three-helpers.js'
import BraceletBuilder from './lib/BraceletBuilder'
import { SVGRenderer } from './components/SVGRenderer'


let builder = new BraceletBuilder({
  width: 120,
  links: 50,
  kerf: 0,
  linkLengthPercentage: 0.75,
  materialWidth: 2
})

let threeObject = builder.build()
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
