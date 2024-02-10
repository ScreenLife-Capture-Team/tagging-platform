// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  projectDataValidator,
  projectPatchValidator,
  projectQueryValidator,
  projectResolver,
  projectExternalResolver,
  projectDataResolver,
  projectPatchResolver,
  projectQueryResolver,
  projectPreDataResolver
} from './projects.schema'

import type { Application, HookContext } from '../../declarations'
import { ProjectService, getOptions } from './projects.class'
import { projectPath, projectMethods } from './projects.shared'
import { transaction } from '@feathersjs/knex'

export * from './projects.class'
export * from './projects.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const project = (app: Application) => {
  // Register our service on the Feathers application
  app.use(projectPath, new ProjectService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: projectMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(projectPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(projectExternalResolver),
        schemaHooks.resolveResult(projectResolver)
      ]
    },
    before: {
      all: [
        transaction.start(),
        schemaHooks.validateQuery(projectQueryValidator),
        schemaHooks.resolveQuery(projectQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(projectDataValidator),
        schemaHooks.resolveData(projectPreDataResolver),
        schemaHooks.resolveData(projectDataResolver)
      ],
      patch: [schemaHooks.validateData(projectPatchValidator), schemaHooks.resolveData(projectPatchResolver)],
      remove: []
    },
    after: {
      all: [transaction.end()]
    },
    error: {
      all: [transaction.rollback()]
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [projectPath]: ProjectService
  }
}
