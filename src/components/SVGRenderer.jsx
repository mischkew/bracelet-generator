import React, { Component } from 'react'

let outline = {
  lineWidthFile: 0.004,
  lineWidth: 0.4,
  scale: 4
}


export default class SVGRenderer extends Component {
  buildPathDescription(mesh) {
    return mesh
      .geometry
      .vertices
      .map((vertex) => vertex.clone())
      .map((vertex) => {
        vertex.applyMatrix4(mesh.matrix)
        mesh.traverseAncestors(object => vertex.applyMatrix4(object.matrix))
        return vertex
      })
      .reduce(
        (pathString, vertex) => pathString + vertex.x + "," + vertex.y + " ",
        'M '
      ) + 'z'
    }

  renderThreeObject() {
    const paths = []
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
    } else if (this.props.geometries) {
      return this.props
        .geometries
        .map(this.renderPath)
    } else if (this.props.geometry) {
      return this.renderPath(this.props.geometry)
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
