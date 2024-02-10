// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../../declarations'
import { dataValidator, queryValidator } from '../../../validators'
import type { ProjectsSyncService } from './sync.class'

// Main data model schema
export const projectsSyncSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'ProjectsSync', additionalProperties: false }
)
export type ProjectsSync = Static<typeof projectsSyncSchema>
export const projectsSyncValidator = getValidator(projectsSyncSchema, dataValidator)
export const projectsSyncResolver = resolve<ProjectsSync, HookContext<ProjectsSyncService>>({})

export const projectsSyncExternalResolver = resolve<ProjectsSync, HookContext<ProjectsSyncService>>({})

// Schema for creating new entries
export const projectsSyncDataSchema = Type.Pick(projectsSyncSchema, ['text'], {
  $id: 'ProjectsSyncData'
})
export type ProjectsSyncData = Static<typeof projectsSyncDataSchema>
export const projectsSyncDataValidator = getValidator(projectsSyncDataSchema, dataValidator)
export const projectsSyncDataResolver = resolve<ProjectsSync, HookContext<ProjectsSyncService>>({})

// Schema for updating existing entries
export const projectsSyncPatchSchema = Type.Partial(projectsSyncSchema, {
  $id: 'ProjectsSyncPatch'
})
export type ProjectsSyncPatch = Static<typeof projectsSyncPatchSchema>
export const projectsSyncPatchValidator = getValidator(projectsSyncPatchSchema, dataValidator)
export const projectsSyncPatchResolver = resolve<ProjectsSync, HookContext<ProjectsSyncService>>({})

// Schema for allowed query properties
export const projectsSyncQueryProperties = Type.Pick(projectsSyncSchema, ['id', 'text'])
export const projectsSyncQuerySchema = Type.Intersect(
  [
    querySyntax(projectsSyncQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ProjectsSyncQuery = Static<typeof projectsSyncQuerySchema>
export const projectsSyncQueryValidator = getValidator(projectsSyncQuerySchema, queryValidator)
export const projectsSyncQueryResolver = resolve<ProjectsSyncQuery, HookContext<ProjectsSyncService>>({})
