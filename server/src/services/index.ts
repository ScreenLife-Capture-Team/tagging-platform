import { model } from './models/models'
import { exportToken } from './export-tokens/export-tokens'
import { user } from './users/users'
import { image } from './images/images'
import { session } from './sessions/sessions'
import { sessionsSync } from './sessions/sync/sync'
import { projectsSync } from './projects/sync/sync'
import { imageTag } from './imageTags/imageTags'
import { tag } from './tags/tags'
import { tagset } from './tagsets/tagsets'
import { project } from './projects/projects'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(model)
  app.configure(exportToken)
  app.configure(user)
  app.configure(image)
  app.configure(session)
  app.configure(sessionsSync)
  app.configure(projectsSync)
  app.configure(imageTag)
  app.configure(tag)
  app.configure(tagset)
  app.configure(project)
  // All services will be registered here
}
