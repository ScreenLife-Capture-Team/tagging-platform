// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { TagsetService } from './tagsets.class'

// Main data model schema
export const tagsetSchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String()
  },
  { $id: 'Tagset', additionalProperties: false }
)
export type Tagset = Static<typeof tagsetSchema>
export const tagsetValidator = getValidator(tagsetSchema, dataValidator)
export const tagsetResolver = resolve<Tagset, HookContext<TagsetService>>({})

export const tagsetExternalResolver = resolve<Tagset, HookContext<TagsetService>>({})

// Schema for creating new entries
export const tagsetDataSchema = Type.Pick(tagsetSchema, ['name'], {
  $id: 'TagsetData'
})
export type TagsetData = Static<typeof tagsetDataSchema>
export const tagsetDataValidator = getValidator(tagsetDataSchema, dataValidator)
export const tagsetDataResolver = resolve<Tagset, HookContext<TagsetService>>({})

// Schema for updating existing entries
export const tagsetPatchSchema = Type.Partial(tagsetSchema, {
  $id: 'TagsetPatch'
})
export type TagsetPatch = Static<typeof tagsetPatchSchema>
export const tagsetPatchValidator = getValidator(tagsetPatchSchema, dataValidator)
export const tagsetPatchResolver = resolve<Tagset, HookContext<TagsetService>>({})

// Schema for allowed query properties
export const tagsetQueryProperties = Type.Pick(tagsetSchema, ['id', 'name'])
export const tagsetQuerySchema = Type.Intersect(
  [
    querySyntax(tagsetQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type TagsetQuery = Static<typeof tagsetQuerySchema>
export const tagsetQueryValidator = getValidator(tagsetQuerySchema, queryValidator)
export const tagsetQueryResolver = resolve<TagsetQuery, HookContext<TagsetService>>({})
