import { cpus } from 'os'
import * as http from 'http'
import * as cluster from 'cluster'

// Utils
import * as Utils from './Utils'
import * as UtilsTypes from './types/utils'
import { OptionsServer } from './types/options'

// Mapper
import * as AutoMapper from './AutoMapper'

// Router
import Router from './Functions/Router/Router'
import Action from './Functions/Router/Action'
import Controller from './Functions/Router/Controller'
import GroupController from './Functions/Router/GroupController'

// Auth
import Token from './Functions/Auth/Token'

// Settings
import Settings from './Functions/Settings/Settings'

// Models
import HashToken from './Models/HashToken/HashToken'
import BaseEntity from './Models/BaseEntity/BaseEntity'
import './Models/ChangeHistory/ChangeHistoryAutoMapper'
import ChangeHistory from './Models/ChangeHistory/ChangeHistory'

// Services
import BaseService from './Services/BaseService'

// Repository
import DataBase from './Repository/DataBase/DataBase'
import BaseRepository from './Repository/Base/BaseRepository'

export default class NucleoApi {
  public startup (init: () => Promise<http.RequestListener>, options: OptionsServer, migrations?: () => Promise<void>) {
    Settings.setMetadata(options)

    if (cluster.isMaster) {
      console.log('====================================')
      console.log('INITIALIZING MASTER WORKER PROCESS!!')
      console.log('====================================')

      // Setting token secret key
      Settings.setSecret()

      if (Settings.multiprocessing) {
        const dataBase = new DataBase()
        dataBase.connect(migrations)

        const cpusLength = cpus().length
        console.log(`\nStarting ${cpusLength} cpu cores...`)

        for (let i = 0; i < cpus().length; i++) cluster.fork()
        cluster.on('exit', (worker, code, signal) => {
          cluster.fork()
          console.log(`\nWorker ${worker.process.pid} died (${signal || code}). Restarting...`)
        })
      } else this._createServer(init, migrations)
    } else this._createServer(init)
  }

  private async _createServer (init: () => Promise<http.RequestListener>, migrations?: () => Promise<void>) {
    const dataBase = new DataBase()
    const { 0: server } = await Promise.all([init(), dataBase.connect(migrations)])

    console.log(`\nWorker ${process.pid} started!`)
    http.createServer(server).listen(Settings.port)
  }
}

export { Utils, UtilsTypes, AutoMapper, Router, Action, Controller, GroupController, Token, Settings, HashToken, BaseEntity, ChangeHistory, BaseService, DataBase, BaseRepository }
