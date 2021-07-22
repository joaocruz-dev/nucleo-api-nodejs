import * as fs from 'fs'
import * as path from 'path'

import { randomString } from '../../Utils'
import { OptionsServer, OptionsMetadata } from '../../types/options'

const metadata = path.join(__dirname, './metadata.json')

export default class Settings {
  static get version (): string { return Settings.getMetadata().version }

  static get isSandBox (): boolean { return Settings.getMetadata().sandbox }

  static get tokenSecret (): string { return Settings.getMetadata().token.secret }

  static get isDevelopment (): boolean { return process.env.NODE_ENV === 'development' }

  static get environment (): string {
    if (Settings.isSandBox) return 'sandbox'
    return Settings.isDevelopment ? 'development' : 'production'
  }

  static get port (): number {
    const port = Settings.getMetadata().server.port
    switch (Settings.environment) {
      case 'sandbox':
        return port.sandbox

      case 'production':
        return port.prod

      default:
        return port.dev
    }
  }

  static get multiprocessing (): boolean {
    const multiprocessing = Settings.getMetadata().server.multiprocessing
    switch (Settings.environment) {
      case 'sandbox':
        return multiprocessing.sandbox

      case 'production':
        return multiprocessing.prod

      default:
        return multiprocessing.dev
    }
  }

  static get connection (): string {
    const conection = Settings.getMetadata().mongodb.conection
    switch (Settings.environment) {
      case 'sandbox':
        return conection.sandbox

      case 'production':
        return conection.prod

      default:
        return conection.dev
    }
  }

  static get endpointApi (): string {
    const api = Settings.getMetadata().endpoint.api
    switch (Settings.environment) {
      case 'sandbox':
        return api.sandbox

      case 'production':
        return api.prod

      default:
        return api.dev
    }
  }

  static get endpointView (): string {
    const view = Settings.getMetadata().endpoint.view
    switch (Settings.environment) {
      case 'sandbox':
        return view.sandbox

      case 'production':
        return view.prod

      default:
        return view.dev
    }
  }

  static getMetadata (): OptionsMetadata {
    if (!fs.existsSync(metadata)) return defaultOptions
    const data = fs.readFileSync(metadata, 'utf8')
    return JSON.parse(data)
  }

  static setMetadata (options: OptionsServer): void {
    const _options = Settings.getMetadata()

    _options.version = options.version
    _options.sandbox = options.sandbox

    _options.server.port.dev = options.server.port.dev
    _options.server.port.prod = options.server.port.prod
    _options.server.port.sandbox = options.server.port.sandbox

    _options.server.multiprocessing.dev = options.server.multiprocessing.dev
    _options.server.multiprocessing.prod = options.server.multiprocessing.prod
    _options.server.multiprocessing.sandbox = options.server.multiprocessing.sandbox

    _options.endpoint.api.dev = options.endpoint.api.dev
    _options.endpoint.api.prod = options.endpoint.api.prod
    _options.endpoint.api.sandbox = options.endpoint.api.sandbox

    _options.endpoint.view.dev = options.endpoint.view.dev
    _options.endpoint.view.prod = options.endpoint.view.prod
    _options.endpoint.view.sandbox = options.endpoint.view.sandbox

    _options.mongodb.name = options.mongodb.name

    _options.mongodb.conection.dev = options.mongodb.conection.dev
    _options.mongodb.conection.prod = options.mongodb.conection.prod
    _options.mongodb.conection.sandbox = options.mongodb.conection.sandbox

    const data = JSON.stringify(_options)
    fs.writeFileSync(metadata, data, 'utf8')
  }

  static setSecret (): void {
    const _options = Settings.getMetadata()

    let secret = _options.token.deafult
    if (!Settings.isDevelopment) secret = randomString(1024)

    _options.token.secret = secret
    const data = JSON.stringify(_options)
    fs.writeFileSync(metadata, data, 'utf8')
  }
}

const defaultOptions = {
  version: '0.0.1',
  sandbox: false,
  server: {
    port: {
      dev: 3000,
      prod: 3000,
      sandbox: 3000
    },
    multiprocessing: {
      dev: false,
      prod: true,
      sandbox: true
    }
  },
  endpoint: {
    api: {
      dev: '',
      prod: '',
      sandbox: ''
    },
    view: {
      dev: '',
      prod: '',
      sandbox: ''
    }
  },
  mongodb: {
    name: '',
    conection: {
      dev: '',
      prod: '',
      sandbox: ''
    }
  },
  token: {
    secret: '',
    deafult: 'bwOmXXX36UKHaRflHgqPxXonklfMFdbdQDN7tlPd42uxJmvuHh'
  }
}
