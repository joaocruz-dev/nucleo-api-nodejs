import { AutoMap } from '@nartc/automapper'

import { randomString } from '../../Utils'

export default class HashToken {
  @AutoMap()
  public hash: string

  @AutoMap()
  public validity: string

  @AutoMap()
  public dateCreated: string

  @AutoMap()
  public identification: string

  public verify (identification: string, hash: string): boolean {
    if (hash !== this.hash) return false
    if (identification !== this.identification) return false
    if (this.validity && new Date(this.validity).getTime() < new Date().getTime()) return false

    return true
  }

  public generateHash (length = 30): void {
    this.hash = randomString(length)
    this.dateCreated = new Date().toISOString()
  }
}
