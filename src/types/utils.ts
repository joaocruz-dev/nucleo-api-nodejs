import { ObjectId } from 'mongodb'

export type Id = string | ObjectId

export interface TypeClass<T> {
  new (...args: any[]): T
}

export { ObjectId }
