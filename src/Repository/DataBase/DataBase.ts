import { MongoClient, Db } from 'mongodb'

import Settings from '../../Functions/Settings/Settings'

let db: Db = null
const dbName = Settings.getMetadata().mongodb.name
const client = new MongoClient(Settings.connection, { useUnifiedTopology: true })

export default class DataBase {
  public connect (migrations?: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) return resolve()
      client.connect(async (e, client) => {
        if (e) return reject(e)
        db = client.db(dbName)

        if (migrations) {
          console.log('Running migrations...')
          await migrations()
        }

        resolve()
      })
    })
  }

  public get db () { return db }

  public get isConnected () { return client.isConnected() }
}
