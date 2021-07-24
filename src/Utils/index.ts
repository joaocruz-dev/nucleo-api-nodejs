import * as fs from 'fs'
import { plainToClass } from 'class-transformer'

import { TypeClass } from '../types/utils'
import { OptionsRandomString } from '../types/options'

export const keys = <T extends object> (obj: T): Array<keyof T> => {
  return Object.keys(obj) as Array<keyof T>
}

export const ToClass = (data: any | any[], destination: TypeClass<any>): Promise<any | any[]> => {
  return new Promise((resolve, reject) => {
    resolve(plainToClass(destination, data))
  })
}

export const filterOfText = (text: string): RegExp => {
  text = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  return new RegExp(text, 'i')
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
