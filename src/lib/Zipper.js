import { toMarkup } from '../components/SVGRenderer'
import JSZip from 'jszip'

export default class Zipper {
  static reactToMarkup(element) {
    return ReactDOM.renderToStaticMarkup(element)
  }

  static generateZip(markup) {
    let zip = new JSZip()
    zip.file('plan.svg', markup, { type: 'text/svg' })
    return zip.generate({ type: 'blob' })
  }

  static getUrl(element) {
    const zipBlob = this.getBlob(element)
    return window.URL.createObjectURL(zipBlob, { type: 'blob' })
  }

  static getBlob(element) {
    return this.generateZip(toMarkup(element))
  }
}
