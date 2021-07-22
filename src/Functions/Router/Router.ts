import { Request } from 'express'

import Controller from './Controller'

export default abstract class Router {
  public path: string

  constructor (
    private _req: Request,
    private _controllers: Controller[]
  ) {
    this._mountPath()
  }

  public get method (): string {
    return this._req.method
  }

  public get url (): string {
    return this._req.originalUrl.split('/api/')[1]
  }

  public get action () {
    const controller = this._controllers.find(controller => `${this.path}/`.startsWith(`${controller.router}/`))
    if (!controller) throw new Error('Controller não encontrado')
    const path = this.path.split(`${controller.router}/`)[1] || null
    const action = controller.actions.find(action => action.route === path && action.method === this.method)
    if (!action) throw new Error('Action não encontrada')
    return { controller, action }
  }

  public get params (): any {
    const url = this._req.originalUrl.split('/')
    const path = `/api/${this.path}`.split('/')

    const params: any = {}
    for (let i = 0; i < path.length; i++) {
      if (path[i].startsWith(':')) params[path[i].replace(':', '')] = url[i]
    }
    return params
  }

  private _mountPath (): void {
    try {
      const url = this._req.originalUrl.split('?')[0]
      const layer = this._req.app._router.stack.find((layer: any) => {
        return layer.regexp.exec(url) && layer.route
      })
      this.path = layer.route.path.split('/api/')[1]
    } catch (error) {
      throw new Error('Router não encontrado')
    }
  }
}
