import { ObjectId } from 'mongodb'
import { AutoMap } from '@nartc/automapper'

import ChangeHistory from '../ChangeHistory/ChangeHistory'

export default abstract class BaseEntity {
  @AutoMap()
  _id: ObjectId

  @AutoMap()
  remove?: boolean

  @AutoMap()
  changeHistory?: ChangeHistory[]
}
