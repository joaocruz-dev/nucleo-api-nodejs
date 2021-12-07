import { ObjectId, Collection, FilterQuery, FindOneOptions, OptionalId } from 'mongodb'

import DataBase from '../DataBase/DataBase'
import { keys, ToClass } from '../../Utils'
import { Id, TypeClass } from '../../types/utils'
import BaseEntity from '../../Models/BaseEntity/BaseEntity'
import ChangeHistory from '../../Models/ChangeHistory/ChangeHistory'

export default abstract class BaseRepository<T extends BaseEntity> {
  private _Entity: TypeClass<T>
  private _dataBase = new DataBase()
  private _collection: string = null
  private _filters: Array<keyof T> = ['_id']

  constructor (Entity: TypeClass<T>, collection?: string, filters?: Array<keyof T>) {
    this._Entity = Entity
    if (!collection) {
      collection = Entity.name + 's'
      collection = collection[0].toUpperCase() + collection.substr(1)
    }
    this._collection = collection
    this._filters = this._filters.concat(filters || [])
  }

  public get collection (): Collection<T> {
    return this._dataBase.db.collection<T>(this._collection)
  }

  public async getSize (filter?: FilterQuery<T>): Promise<number> {
    return await this.collection.countDocuments(filter)
  }

  public async getId (id: Id, options?: FindOneOptions<T extends any ? any: any>): Promise<T> {
    const filter = <FilterQuery<T>>{ _id: new ObjectId(id) }
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

    if (info?.result?.n !== 1) throw new Error(`${this._Entity.name} not added`)
  }

  public async update (data: T, changeHistory?: ChangeHistory): Promise<void> {
    if (keys(data).find(x => x === 'remove')) delete data.remove
    await this._update(data, changeHistory)
  }

  public async remove (data: T, changeHistory?: ChangeHistory): Promise<void> {
    try {
      const _data = new this._Entity()
      _data.remove = true
      _data.changeHistory = []

      this._filters.forEach(x => {
        _data[x] = data[x]
      })

      await this._update(_data, changeHistory)
    } catch (error) {
      throw new Error(`${this._Entity.name} not removed`)
    }
  }

  public async removeMany (data: T[], changeHistory?: ChangeHistory): Promise<void> {
    try {
      const _data = new this._Entity()
      _data._id = null
      _data.remove = true
      _data.changeHistory = []

      await this._updateMany(data, _data, changeHistory)
    } catch (error) {
      throw new Error(`${this._Entity.name} not removed`)
    }
  }

  public async delete (data: T): Promise<void> {
    const filter: FilterQuery<T> = {}
    this._filters.forEach(x => {
      if (x === '_id') filter._id = <any>new ObjectId(data._id)
      else filter[x] = data[x]
    })

    const info = await this.collection.deleteOne(filter)
    if (info?.result?.n !== 1) throw new Error(`${this._Entity.name} not deleted`)
  }

  public async deleteMany (data: T[]): Promise<void> {
    if (!data.length) return

    const filter: FilterQuery<T> = {}
    this._filters.forEach(x => {
      if (x === '_id') filter._id = { $in: data.map(x => <any>new ObjectId(x._id)) }
      else filter[x] = data[0][x]
    })

    const info = await this.collection.deleteMany(filter)
    if (!(info?.result?.n > 0)) throw new Error(`${this._Entity.name} not deleted`)
  }

  private async _update (data: T, changeHistory?: ChangeHistory): Promise<void> {
    let push: any = null

    const filter: FilterQuery<T> = {}
    this._filters.forEach(x => {
      if (x === '_id') filter._id = <any>new ObjectId(data._id)
      else filter[x] = data[x]
    })

    delete data._id
    if (keys(data).find(x => x === 'changeHistory')) {
      delete data.changeHistory
      if (changeHistory) {
        push = {}
        changeHistory.date = new Date().toISOString()
        push.changeHistory = changeHistory
      }
    }

    const update: any = { $set: data }
    if (push) update.$push = push

    const info = await this.collection.updateOne(filter, update)
    if (info?.result?.n !== 1) throw new Error(`${this._Entity.name} not updated`)
  }

  private async _updateMany (values: T[], data: T, changeHistory?: ChangeHistory): Promise<void> {
    let push: any = null

    const filter: FilterQuery<T> = {}
    this._filters.forEach(x => {
      if (x === '_id') filter._id = { $in: values.map(x => <any>new ObjectId(x._id)) }
      else filter[x] = values[0][x]
    })

    delete data._id
    if (keys(data).find(x => x === 'changeHistory')) {
      delete data.changeHistory
      if (changeHistory) {
        push = {}
        changeHistory.date = new Date().toISOString()
        push.changeHistory = changeHistory
      }
    }

    const update: any = { $set: data }
    if (push) update.$push = push

    const info = await this.collection.updateMany(filter, update)
    if (!(info?.result?.n > 0)) throw new Error(`${this._Entity.name} not updated`)
  }
}
