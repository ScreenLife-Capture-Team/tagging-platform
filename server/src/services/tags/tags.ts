// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  tagDataValidator,
  tagPatchValidator,
  tagQueryValidator,
  tagResolver,
  tagExternalResolver,
  tagDataResolver,
  tagPatchResolver,
  tagQueryResolver
} from './tags.schema'

import type { Application, HookContext, NextFunction } from '../../declarations'
import { TagService, getOptions } from './tags.class'
import { tagPath, tagMethods } from './tags.shared'

export * from './tags.class'
export * from './tags.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const tag = (app: Application) => {
  // Register our service on the Feathers application
  app.use(tagPath, new TagService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: tagMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(tagPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(tagExternalResolver),
        schemaHooks.resolveResult(tagResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(tagQueryValidator), schemaHooks.resolveQuery(tagQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(tagDataValidator), schemaHooks.resolveData(tagDataResolver)],
      patch: [schemaHooks.validateData(tagPatchValidator), schemaHooks.resolveData(tagPatchResolver)],
      remove: []
    },
    after: {
      all: [],
      create: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [tagPath]: TagService
  }
}
