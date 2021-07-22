import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

import Settings from '../Settings/Settings'

export default class Token {
  static sign (data: object, time = 3600) {
    return jwt.sign(data, Settings.tokenSecret, {
      expiresIn: time
    })
  }

  static verify (token: string) {
    try {
      return jwt.verify(token, Settings.tokenSecret)
    } catch (e) {
      throw new Error('Token inválido')
    }
  }

  static comparePass (origin: string, value: string): boolean {
    return bcrypt.compareSync(value, origin)
  }

  static newPass (value: string): string {
    return bcrypt.hashSync(value, 10)
  }
}
