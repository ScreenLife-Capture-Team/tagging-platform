// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { SessionsSyncService } from './sync.class'

// Main data model schema
export const sessionsSyncSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'SessionsSync', additionalProperties: false }
)
export type SessionsSync = Static<typeof sessionsSyncSchema>
export const sessionsSyncValidator = getValidator(sessionsSyncSchema, dataValidator)
export const sessionsSyncResolver = resolve<SessionsSync, HookContext<SessionsSyncService>>({})

export const sessionsSyncExternalResolver = resolve<SessionsSync, HookContext<SessionsSyncService>>({})

// Schema for creating new entries
export const sessionsSyncDataSchema = Type.Object(
  {
    participantId: Type.String()
  },
  {
    $id: 'SessionsSyncData'
  }
)
export type SessionsSyncData = Static<typeof sessionsSyncDataSchema>
export const sessionsSyncDataValidator = getValidator(sessionsSyncDataSchema, dataValidator)
export const sessionsSyncDataResolver = resolve<SessionsSync, HookContext<SessionsSyncService>>({})

// Schema for updating existing entries
export const sessionsSyncPatchSchema = Type.Partial(sessionsSyncSchema, {
  $id: 'SessionsSyncPatch'
})
export type SessionsSyncPatch = Static<typeof sessionsSyncPatchSchema>
export const sessionsSyncPatchValidator = getValidator(sessionsSyncPatchSchema, dataValidator)
export const sessionsSyncPatchResolver = resolve<SessionsSync, HookContext<SessionsSyncService>>({})

// Schema for allowed query properties
export const sessionsSyncQueryProperties = Type.Pick(sessionsSyncSchema, ['id', 'text'])
export const sessionsSyncQuerySchema = Type.Intersect(
  [
    querySyntax(sessionsSyncQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type SessionsSyncQuery = Static<typeof sessionsSyncQuerySchema>
export const sessionsSyncQueryValidator = getValidator(sessionsSyncQuerySchema, queryValidator)
export const sessionsSyncQueryResolver = resolve<SessionsSyncQuery, HookContext<SessionsSyncService>>({})
