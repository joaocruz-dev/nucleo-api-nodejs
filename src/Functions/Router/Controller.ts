import { AutoMap } from '@nartc/automapper'

import Action from './Action'
import { TypeClass } from '../../types/utils'

export default class Controller {
  @AutoMap()
  public id: string

  @AutoMap()
  public name: string

  @AutoMap()
  public router: string

  @AutoMap()
  public classController: TypeClass<any>

  @AutoMap()
  public actions: Action[]

  static verifyIds (controllers: Controller[]): void {
    let ids = controllers
      .map(x => [x.id, ...x.actions.map(y => y.id)])
      .reduce((acc, x) => acc.concat(x), [])

    ids = ids.filter((x, i) => ids.findIndex(y => y === x) !== i)
    if (ids.length) throw new Error(`There are duplicate IDS routes! ${ids}`)
  }
}
