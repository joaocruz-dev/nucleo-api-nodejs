import {
  AutoMapper,
  condition,
  convertUsing,
  createMapMetadata,
  defaultNamingConvention,
  fromValue,
  ignore,
  mapDefer,
  mapFrom,
  mapWith,
  nullSubstitution,
  preCondition
} from '@nartc/automapper'

import { TypeClass } from '../types/utils'

const Mapper = new AutoMapper()

const ToMapper = (data: any | any[], destination: TypeClass<any>): Promise<any | any[]> => {
  return new Promise((resolve, reject) => {
    if (Array.isArray(data)) resolve(Mapper.mapArray(data, destination))
    else resolve(Mapper.map(data, destination))
  })
}

export { Mapper, ToMapper, condition, convertUsing, createMapMetadata, defaultNamingConvention, fromValue, ignore, mapDefer, mapFrom, mapWith, nullSubstitution, preCondition }
