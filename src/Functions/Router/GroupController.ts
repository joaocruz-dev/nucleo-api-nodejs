import { AutoMap } from '@nartc/automapper'

import Controller from './Controller'

export default class GroupController {
  @AutoMap()
  public name: string

  @AutoMap()
  public icon: string

  @AutoMap()
  public controllers: Controller[]

  static getPublicGroups (controllers: GroupController[]): GroupController[] {
    return controllers
      .map(permission => {
        permission.controllers = permission.controllers.map(controller => {
          delete controller.router
          controller.actions.map(action => {
            delete action.route
            delete action.method
            return action
          })
          return controller
        })
        return permission
      })
  }
}
