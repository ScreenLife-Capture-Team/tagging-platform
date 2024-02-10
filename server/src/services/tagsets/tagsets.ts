// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  tagsetDataValidator,
  tagsetPatchValidator,
  tagsetQueryValidator,
  tagsetResolver,
  tagsetExternalResolver,
  tagsetDataResolver,
  tagsetPatchResolver,
  tagsetQueryResolver
} from './tagsets.schema'

import type { Application } from '../../declarations'
import { TagsetService, getOptions } from './tagsets.class'
import { tagsetPath, tagsetMethods } from './tagsets.shared'

export * from './tagsets.class'
export * from './tagsets.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const tagset = (app: Application) => {
  // Register our service on the Feathers application
  app.use(tagsetPath, new TagsetService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: tagsetMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(tagsetPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(tagsetExternalResolver),
        schemaHooks.resolveResult(tagsetResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(tagsetQueryValidator), schemaHooks.resolveQuery(tagsetQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(tagsetDataValidator), schemaHooks.resolveData(tagsetDataResolver)],
      patch: [schemaHooks.validateData(tagsetPatchValidator), schemaHooks.resolveData(tagsetPatchResolver)],
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
    [tagsetPath]: TagsetService
  }
}
