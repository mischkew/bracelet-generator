import ReactDOM from 'react-dom/server'
import JSZip from 'jszip'


export default class Zipper {
  static reactToMarkup(element) {
    return ReactDOM.renderToStaticMarkup(element)
  }

  static generateZip(markup) {
    let zip = new JSZip()
    zip.file('plan.svg', markup, { type: 'text/svg' })

    let zipBlob = zip.generate({ type: 'blob' })
    return window.URL.createObjectURL(zipBlob, { type: 'blob' })
  }

  static getUrl(element) {
    return this.generateZip(this.reactToMarkup(element))
  }
}
