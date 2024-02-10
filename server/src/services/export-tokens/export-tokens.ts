// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  exportTokenDataValidator,
  exportTokenPatchValidator,
  exportTokenQueryValidator,
  exportTokenResolver,
  exportTokenExternalResolver,
  exportTokenDataResolver,
  exportTokenPatchResolver,
  exportTokenQueryResolver
} from './export-tokens.schema'

import type { Application } from '../../declarations'
import { ExportTokenService, getOptions } from './export-tokens.class'
import { exportTokenPath, exportTokenMethods } from './export-tokens.shared'

export * from './export-tokens.class'
export * from './export-tokens.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const exportToken = (app: Application) => {
  // Register our service on the Feathers application
  app.use(exportTokenPath, new ExportTokenService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: exportTokenMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(exportTokenPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(exportTokenExternalResolver),
        schemaHooks.resolveResult(exportTokenResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(exportTokenQueryValidator),
        schemaHooks.resolveQuery(exportTokenQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(exportTokenDataValidator),
        schemaHooks.resolveData(exportTokenDataResolver)
      ],
      patch: [
        schemaHooks.validateData(exportTokenPatchValidator),
        schemaHooks.resolveData(exportTokenPatchResolver)
      ],
      remove: []
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
declare module '../../declarations' {
  interface ServiceTypes {
    [exportTokenPath]: ExportTokenService
  }
}
