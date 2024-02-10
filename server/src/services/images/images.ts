// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  imageDataValidator,
  imagePatchValidator,
  imageQueryValidator,
  imageResolver,
  imageExternalResolver,
  imageDataResolver,
  imagePatchResolver,
  imageQueryResolver
} from './images.schema'

import type { Application } from '../../declarations'
import { ImageService, getOptions } from './images.class'
import { imagePath, imageMethods } from './images.shared'

export * from './images.class'
export * from './images.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const image = (app: Application) => {
  // Register our service on the Feathers application
  app.use(imagePath, new ImageService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: imageMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(imagePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(imageExternalResolver),
        schemaHooks.resolveResult(imageResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(imageQueryValidator), schemaHooks.resolveQuery(imageQueryResolver)],
      find: [],
      get: []
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
    [imagePath]: ImageService
  }
}
