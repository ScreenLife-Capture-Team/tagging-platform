// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  sessionsSyncDataValidator,
  sessionsSyncPatchValidator,
  sessionsSyncQueryValidator,
  sessionsSyncResolver,
  sessionsSyncExternalResolver,
  sessionsSyncDataResolver,
  sessionsSyncPatchResolver,
  sessionsSyncQueryResolver
} from './sync.schema'

import type { Application } from '../../../declarations'
import { SessionsSyncService, getOptions } from './sync.class'
import { sessionsSyncPath, sessionsSyncMethods } from './sync.shared'

export * from './sync.class'
export * from './sync.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const sessionsSync = (app: Application) => {
  // Register our service on the Feathers application
  app.use(sessionsSyncPath, new SessionsSyncService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: sessionsSyncMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(sessionsSyncPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(sessionsSyncExternalResolver),
        schemaHooks.resolveResult(sessionsSyncResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(sessionsSyncQueryValidator),
        schemaHooks.resolveQuery(sessionsSyncQueryResolver)
      ],
      create: [
        schemaHooks.validateData(sessionsSyncDataValidator),
        schemaHooks.resolveData(sessionsSyncDataResolver)
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
    [sessionsSyncPath]: SessionsSyncService
  }
}
