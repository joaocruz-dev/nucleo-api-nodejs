import { ObjectId, Collection, FilterQuery, FindOneOptions, OptionalId } from 'mongodb'

import DataBase from '../DataBase/DataBase'
import { keys, ToClass } from '../../Utils'
import { Id, TypeClass } from '../../types/utils'
import BaseEntity from '../../Models/BaseEntity/BaseEntity'
import ChangeHistory from '../../Models/ChangeHistory/ChangeHistory'

export default abstract class BaseRepository<T extends BaseEntity> {
  private _Entity: TypeClass<T>
  private dataBase = new DataBase()
  private _collection: string = null

  constructor (Entity: TypeClass<T>, name?: string) {
    this._Entity = Entity
    if (!name) {
      name = Entity.name + 's'
      name = name[0].toUpperCase() + name.substr(1)
    }
    this._collection = name
  }

  public get collection (): Collection<T> {
    return this.dataBase.db.collection<T>(this._collection)
  }

  public async getSize (filter?: FilterQuery<T>): Promise<number> {
    return await this.collection.countDocuments(filter)
  }

  public async getId (id: Id, options?: FindOneOptions<T extends any ? any: any>): Promise<T> {
    const filter = <T>{ _id: new ObjectId(id) }
    const data = await this.collection.findOne<T>(filter, options)
    return data ? <T>(await ToClass(data, this._Entity)) : null
  }

  public async getAll (filter?: FilterQuery<T>, options?: FindOneOptions<T extends any ? any: any>): Promise<T[]> {
    const datas = await this.collection.find<T>(filter, options).sort({ _id: 1 }).toArray()
    return <T[]>(await ToClass(datas, this._Entity))
  }

  public async getIds (ids: Id[], options?: FindOneOptions<T extends any ? any: any>): Promise<T[]> {
    const filter = <FilterQuery<T>>{
      _id: { $in: ids.map(x => new ObjectId(x)) }
    }
    return await this.getAll(filter, options)
  }

  async getFilter (filter?: FilterQuery<T>, options?: FindOneOptions<T extends any ? any: any>): Promise<T[]> {
    if (!filter) filter = {}
    const _filter = <FilterQuery<T>>{
      ...filter,
      status: { $in: [true, null] },
      remove: { $in: [false, null] }
    }
    return await this.getAll(_filter, options)
  }

  public async getNotRemove (filter?: FilterQuery<T>, options?: FindOneOptions<T extends any ? any: any>): Promise<T[]> {
    if (!filter) filter = {}
    const _filter = <FilterQuery<T>>{
      ...filter,
      remove: false
    }
    return await this.getAll(_filter, options)
  }

  public async add (data: T, changeHistory?: ChangeHistory): Promise<void> {
    if (keys(data).find(x => x === 'remove')) data.remove = false
    if (keys(data).find(x => x === 'changeHistory')) {
      data.changeHistory = []
      if (changeHistory) {
        changeHistory.date = new Date().toISOString()
        data.changeHistory.push(changeHistory)
      }
    }

    if (!ObjectId.isValid(data._id)) delete data._id
    const info = await this.collection.insertOne(<OptionalId<T>> data)

    if (!info || info.result.n !== 1) throw new Error(`${this._Entity.name} not added`)
  }

  public async update (data: T, changeHistory?: ChangeHistory): Promise<void> {
    let push: any = null
    const filter = <T>{ _id: new ObjectId(data._id) }

    if (keys(data).find(x => x === 'changeHistory')) {
      delete data.changeHistory
      if (changeHistory) {
        push = {}
        changeHistory.date = new Date().toISOString()
        push.changeHistory = changeHistory
      }
    }

    delete data._id

    const update: any = { $set: data }
    if (push) update.$push = push

    const info = await this.collection.updateOne(filter, update)
    if (!info || info.result.n !== 1) throw new Error(`${this._Entity.name} not updated`)
  }

  public async remove (data: T, changeHistory?: ChangeHistory): Promise<void> {
    const _data = new this._Entity()
    _data._id = data._id
    _data.remove = true
    if (keys(data).find(x => x === 'changeHistory')) _data.changeHistory = null

    await this.update(_data, changeHistory)
  }

  public async delete (data: T): Promise<void> {
    const filter = <T>{ _id: new ObjectId(data._id) }
    const info = await this.collection.deleteOne(filter)
    if (!info || info.result.n !== 1) throw new Error(`${this._Entity.name} not deleted`)
  }
}
