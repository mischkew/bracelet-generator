import HookClasp from './HookClasp'
import Cut from './Cut'
import Builder from './Builder'
import ClickClasp from './ClickClasp'


export default class BraceletBuilder extends Builder {
  constructor(config) {
    super(config, Cut.generator, ClickClasp)
  }
}
