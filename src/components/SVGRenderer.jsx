import React, { Component } from 'react'
import ReactDOM from 'react-dom/server'
import { getWorldVertices } from '../lib/three-helpers.js'

// TODO: sizes have to be exact mm
let outline = {
  lineWidthFile: 0.004,
  lineWidth: 0.4,
  scale: 4
}

export function toMarkup(element) {
  let svgMarkup = ReactDOM.renderToStaticMarkup(element)
  // xmlns fix because react don't support xmlns:
  // https://github.com/facebook/react/blob/master/src/renderers/dom/shared/SVGDOMPropertyConfig.js#L56
  const insertIndex = 4
  svgMarkup = svgMarkup.slice(0, insertIndex) +
              ' xmlns="http://www.w3.org/2000/svg"' +
              svgMarkup.slice(insertIndex)
  return svgMarkup
}

export class SVGRenderer extends Component {
  buildPathDescription(mesh) {
    return getWorldVertices(mesh)
      .reduce(
        (pathString, vertex) => pathString + vertex.x + "," + vertex.y + " ",
        'M '
      ) + 'z'
    }

  renderThreeObject() {
    const paths = []
    this.props.threeObject.updateMatrixWorld()
    this.props.threeObject.traverse((object) => {
      if (object.geometry) {
        paths.push(this.renderPath(object))
      }
    })
    return paths
  }

  renderPaths() {
    if (this.props.threeObject) {
      return this.renderThreeObject()
    } else {
      throw new Error('this.props.threeObject is not of type THREE.Object3D.')
    }
  }

  renderPath(mesh) {
    const description = this.buildPathDescription(mesh)

    return (
      <path
        style={{
          fill: 'none',
          stroke: '#ff0000',
          strokeWidth: this.props.isFile ? outline.lineWidthFile : outline.lineWidth
        }}
        d={description} />
    )
  }

  render() {
    return (
      <svg
        width={this.props.width * outline.scale}
        height={this.props.height * outline.scale}
        viewBox={`0 0 ${this.props.width} ${this.props.height}`}>
        {this.renderPaths()}
      </svg>
    )
  }
}
