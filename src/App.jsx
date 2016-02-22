import React, { Component } from 'react'
import Zipper from './lib/Zipper'
import { rotateAroundCenter, AXES } from './lib/three-helpers.js'
import BraceletBuilder from './lib/BraceletBuilder'
import { SVGRenderer } from './components/SVGRenderer'
import Slider from 'material-ui/lib/slider'
import Card from 'material-ui/lib/card/card'
import CardActions from 'material-ui/lib/card/card-actions'
import CardHeader from 'material-ui/lib/card/card-header'
import CardMedia from 'material-ui/lib/card/card-media'
import CardTitle from 'material-ui/lib/card/card-title'
import RaisedButton from 'material-ui/lib/raised-button'
import CardText from 'material-ui/lib/card/card-text'
import SettingsIcon from 'react-material-icons/icons/action/settings'
import DownloadIcon from 'react-material-icons/icons/file/file-download'

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
        <RaisedButton
            label="Download SVG"
            linkButton={true}
            href={url}
            style={{margin: '12px'}}
            icon={<DownloadIcon />} />
        <Card>
          <CardHeader
              title="Settings"
              subtitle="Customize your Bracelet"
              avatar={<SettingsIcon />} />
          <CardTitle
              title="General Adjustment"
              subtitle="Adjust between sturdyness and smoothness" />
          <CardText>
            <label>Bracelet size (Radius of your wrist in cm):</label>
            <Slider min={3} max={7} value={3.5} step={0.1} />
            <Slider value={0.5} step={0.1} />
          </CardText>
        </Card>
        <SVGRenderer
          config={builder.config}
          width={builder.getWidth()}
          height={builder.config.height}
          threeObject={threeObject} />
      </div>
    )
  }
}
