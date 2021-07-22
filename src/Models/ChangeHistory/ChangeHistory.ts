import { AutoMap } from '@nartc/automapper'

export default class ChangeHistory {
  @AutoMap()
  public date?: string

  @AutoMap()
  public user: string

  @AutoMap()
  public change: string
}
