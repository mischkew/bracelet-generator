import React, { Component } from 'react'
import update from 'react/lib/update'
import Zipper from '../lib/Zipper'
import FileSaver from 'browser-filesaver'
import { rotateAroundCenter, AXES } from '../lib/three-helpers'
import BraceletBuilder from '../modules/bracelet_generation/lib/BraceletBuilder'
import { buildConfig, estimateRadians, radiansToDegrees } from '../modules/bracelet_generation/lib/Builder'
import { SVGRenderer } from '../components/SVGRenderer'
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
import Badge from 'material-ui/lib/badge'
import NotificationsIcon from 'material-ui/lib/svg-icons/social/notifications'

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
  diameter: 35,
  materialThickness: 3,
  linkGap: 1.5,
  linkLengthPercentage: 0.8
}

export default class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      config: buildConfig(VERSION2),
      constraints: null
    }
    this.handleConfigChange = this.handleConfigChange.bind(this)
    this.downloadBracelet = this.downloadBracelet.bind(this)
  }

  getBuilder() {
    return new BraceletBuilder(this.state.config)
  }

  getBraceletWidth() {
    const width = this.getBuilder().getWidth()
    return parseInt(width * 10) / 10
  }

  renderBracelet(isFile = false) {
    let builder = this.getBuilder()
    let object = builder.build()

    return <SVGRenderer
               isFile={isFile}
               config={builder.config}
               width={builder.getWidth()}
               height={builder.config.height}
               threeObject={object} />
  }

  downloadBracelet() {
    const element = this.renderBracelet(true)
    const blob = Zipper.getBlob(element)
    FileSaver.saveAs(blob, 'bracelet.zip')
  }

  renderConstraintAlert() {
    const builder = this.getBuilder()

    if (!builder.constraints.moreLinksThanAllowedWidth) {
      return null
    }

    return [
      <br />,
      <Badge
          badgeContent="!"
          primary={true}>
        You render too many links for the width. Width is clipped.
      </Badge>
    ]
  }

  updateConfig(value, attribute) {
    const newConfig = update(this.state.config, {
      [attribute]: { $set: value }
    })
    this.setState({ config: newConfig })
  }

  handleConfigChange(attribute) { return (_, value) => this.updateConfig(value, attribute) }

  render() {
    return (
      <div>
        <Card style={{marginBottom: '12px'}}>
          <CardHeader
              title="Bracelet"
              subtitle="Fabricate your personal bracelet on a laser cutter." />
          <CardText>
            {this.renderBracelet()}
          </CardText>
          <CardText>
            <label>Total Length of Bracelet: {this.getBraceletWidth()}cm</label><br />
            { /* <label>Estimated Bend: {radiansToDegrees(estimateRadians(this.state.config))}</label> */ }
          </CardText>
          <CardActions>
            <RaisedButton
                label="Download SVG"
                onClick={this.downloadBracelet}
                style={{margin: '12px'}}
                icon={<DownloadIcon />} />
          </CardActions>
        </Card>

        <Card>
          <CardHeader
              actAsExpander={true}
              showExpandableButton={true}
              title="Settings"
              subtitle="Customize your Bracelet. Adjust between sturdyness and smoothness"
              avatar={<SettingsIcon />} />
          <CardText expandable={true}>
            <label>Diameter of your wrist: {this.state.config.diameter/10}cm</label>
            {this.renderConstraintAlert()}
            <Slider
                min={20} max={70} step={1}
                value={this.state.config.diameter}
                onChange={this.handleConfigChange('diameter')} />

            <label>Bracelet width: {this.state.config.height/10}cm</label>
            <Slider
                min={20} max={50} step={1}
                value={this.state.config.height}
                onChange={this.handleConfigChange('height')} />

            <label>Link Count (less for sturdyness - more for smoothness): {this.state.config.links}</label>
            <Slider
                min={0} max={200} step={1}
                value={this.state.config.links}
                onChange={this.handleConfigChange('links')} />

            <label>Link Gap (less for smoothness - wider for sturdyness): {this.state.config.linkGap}mm</label>
            <Slider
                min={0} max={10} step={0.1}
                value={this.state.config.linkGap}
                onChange={this.handleConfigChange('linkGap')} />

            <label>Link Length (less for sturdyness - wider for smoothness): {this.state.config.linkLengthPercentage}</label>
            <Slider
                min={0.55} max={0.95} step={0.05}
                value={this.state.config.linkLengthPercentage}
                onChange={this.handleConfigChange('linkLengthPercentage')} />

            <label>Link Kerf: {this.state.config.kerf}mm</label>
            <Slider
                min={0.01} max={2} step={0.01}
                value={this.state.config.kerf}
                onChange={this.handleConfigChange('kerf')} />
          </CardText>
        </Card>
      </div>
    )
  }
}
