import { AutoMap } from '@nartc/automapper'

export default class Action {
  @AutoMap()
  public id: string

  @AutoMap()
  public name: string

  @AutoMap()
  public route: string

  @AutoMap()
  public method: string
}
