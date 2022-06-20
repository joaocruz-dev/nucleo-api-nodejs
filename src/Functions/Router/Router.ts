import { Request } from 'express'

import Action from './Action'
import Controller from './Controller'

export default abstract class Router {
  private _path: string

  constructor (
    private _req: Request,
    private _controllers: Controller[]
  ) {
    this._mountPath()
  }

  public get req (): Request {
    return this._req
  }

  public get path (): string {
    return this._path
  }

  public get method (): string {
    return this._req.method
  }

  public get url (): string {
    return this._req.originalUrl.split('/api/')[1].split('?')[0]
  }

  public get action (): { controller: Controller, action: Action } {
    let action = null
    const controller = this._controllers.find(x => {
      action = x.actions.find(action => {
        const path = x.router + (action.route ? `/${action.route}` : '')
        return this.path === path && action.method === this.method
      })
      return action
    })

    if (!controller) throw new Error('Controller not found!')
    if (!action) throw new Error('Action not found!')

    return { controller, action }
  }

  public get params (): { [key: string]: string } {
    const url = this.url.split('/')
    const path = this.path.split('/')

    const params: any = {}
    for (let i = 0; i < path.length; i++) {
      if (path[i].startsWith(':')) params[path[i].replace(':', '')] = url[i]
    }
    return params
  }

  private _mountPath (): void {
    try {
      const layers = this._req.app._router.stack.filter((layer: any) => {
        return layer.regexp.exec(`/api/${this.url}`) && layer.route
      })
      const layer = layers.find((x: any) => x.route.path === `/api/${this.url}`) || layers[0]
      this._path = layer.route.path.split('/api/')[1]
    } catch (error) {
      throw new Error('Router not found')
    }
  }
}
