// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  sessionDataValidator,
  sessionPatchValidator,
  sessionQueryValidator,
  sessionResolver,
  sessionExternalResolver,
  sessionDataResolver,
  sessionPatchResolver,
  sessionQueryResolver
} from './sessions.schema'

import type { Application, HookContext } from '../../declarations'
import { SessionService, getOptions } from './sessions.class'
import { sessionPath, sessionMethods } from './sessions.shared'
import { User } from '../users/users.schema'
import { Forbidden } from '@feathersjs/errors'

export * from './sessions.class'
export * from './sessions.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const session = (app: Application) => {
  // Register our service on the Feathers application
  app.use(sessionPath, new SessionService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: sessionMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(sessionPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(sessionExternalResolver),
        schemaHooks.resolveResult(sessionResolver)
      ]
    },
    before: {
      all: [
        // async (context: HookContext) => {
        //   const user = context.params.user as User | undefined
        //   if (user?.type !== 'admin') throw new Forbidden('Cannot use asUser')
        //   context.asUser = value
        //   return context
        // },
        schemaHooks.validateQuery(sessionQueryValidator),
        schemaHooks.resolveQuery(sessionQueryResolver)
      ],
      find: [],
      get: [],
      create: [schemaHooks.validateData(sessionDataValidator), schemaHooks.resolveData(sessionDataResolver)],
      patch: [schemaHooks.validateData(sessionPatchValidator), schemaHooks.resolveData(sessionPatchResolver)],
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
    [sessionPath]: SessionService
  }
}
