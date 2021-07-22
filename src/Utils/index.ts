import * as fs from 'fs'
import { Mapper } from '@nartc/automapper'
import { plainToClass } from 'class-transformer'

import { TypeClass } from 'src/types/utils'
import { OptionsRandomString } from 'src/types/options'

export const keys = <T extends object> (obj: T): Array<keyof T> => {
  return Object.keys(obj) as Array<keyof T>
}

export const ToClass = <T> (data: T|T[], destination: TypeClass<T>): Promise<T|T[]> => {
  return new Promise((resolve, reject) => {
    resolve(plainToClass(destination, data))
  })
}

export const ToMapper = <T, U> (data: T|T[], destination: TypeClass<U>): Promise<U|U[]> => {
  return new Promise((resolve, reject) => {
    if (Array.isArray(data)) resolve(Mapper.mapArray(data, destination))
    else resolve(Mapper.map(data, destination))
  })
}

export const readFile = (path: string, type: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, type, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

export const writeFile = (path: string, data: string, type: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, type, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export const randomString = (length = 10, options?: OptionsRandomString): string => {
  if (!options) options = {}

  let possible = ''
  if (options.lowercase !== false) possible += 'abcdefghijklmnopqrstuvwxyz'
  if (options.uppercase !== false) possible += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.numeric !== false) possible += '0123456789'
  if (options.special !== false) possible += '*#@$%&'

  let text = ''
  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }
  return text
}
