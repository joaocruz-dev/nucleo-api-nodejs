import { MongoClient, Db } from 'mongodb'

import Settings from '../../Functions/Settings/Settings'

let db: Db = null
let dbName: string = null
let client: MongoClient = null

export default class DataBase {
  public connect (migrations?: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (client) return resolve()

      dbName = Settings.getMetadata().mongodb.name
      client = new MongoClient(Settings.connection, { useUnifiedTopology: true })

      client.connect(async (e, client) => {
        if (e) return reject(e)
        db = client.db(dbName)

        if (migrations) {
          console.log('\nRunning migrations...')
          await migrations()
        }

        resolve()
      })
    })
  }

  public get db () { return db }

  public get isConnected () { return client && client.isConnected() }

  static get isConnected () { return client && client.isConnected() }
}
