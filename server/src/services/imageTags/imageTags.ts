// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  imageTagDataValidator,
  imageTagPatchValidator,
  imageTagQueryValidator,
  imageTagResolver,
  imageTagExternalResolver,
  imageTagDataResolver,
  imageTagPatchResolver,
  imageTagQueryResolver
} from './imageTags.schema'

import type { Application } from '../../declarations'
import { ImageTagService, getOptions } from './imageTags.class'
import { imageTagPath, imageTagMethods } from './imageTags.shared'

export * from './imageTags.class'
export * from './imageTags.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const imageTag = (app: Application) => {
  // Register our service on the Feathers application
  app.use(imageTagPath, new ImageTagService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: imageTagMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(imageTagPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(imageTagExternalResolver),
        schemaHooks.resolveResult(imageTagResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(imageTagQueryValidator),
        schemaHooks.resolveQuery(imageTagQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(imageTagDataValidator),
        schemaHooks.resolveData(imageTagDataResolver)
      ],
      patch: [
        schemaHooks.validateData(imageTagPatchValidator),
        schemaHooks.resolveData(imageTagPatchResolver)
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
    [imageTagPath]: ImageTagService
  }
}
