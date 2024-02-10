// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  projectsSyncDataValidator,
  projectsSyncPatchValidator,
  projectsSyncQueryValidator,
  projectsSyncResolver,
  projectsSyncExternalResolver,
  projectsSyncDataResolver,
  projectsSyncPatchResolver,
  projectsSyncQueryResolver
} from './sync.schema'

import type { Application } from '../../../declarations'
import { ProjectsSyncService, getOptions } from './sync.class'
import { projectsSyncPath, projectsSyncMethods } from './sync.shared'

export * from './sync.class'
export * from './sync.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const projectsSync = (app: Application) => {
  // Register our service on the Feathers application
  app.use(projectsSyncPath, new ProjectsSyncService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: projectsSyncMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(projectsSyncPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(projectsSyncExternalResolver),
        schemaHooks.resolveResult(projectsSyncResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(projectsSyncQueryValidator),
        schemaHooks.resolveQuery(projectsSyncQueryResolver)
      ],
      create: [
        schemaHooks.validateData(projectsSyncDataValidator),
        schemaHooks.resolveData(projectsSyncDataResolver)
      ]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    [projectsSyncPath]: ProjectsSyncService
  }
}
