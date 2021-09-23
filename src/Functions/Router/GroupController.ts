import Controller from './Controller'

export default class GroupController {
  public name: string
  public icon: string
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
