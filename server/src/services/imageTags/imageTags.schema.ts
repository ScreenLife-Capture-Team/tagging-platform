// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ImageTagService } from './imageTags.class'

// Main data model schema
export const imageTagSchema = Type.Object(
  {
    id: Type.Number(),
    image: Type.String(),
    tagId: Type.Integer(),
    userId: Type.Integer()
  },
  { $id: 'ImageTag', additionalProperties: false }
)
export type ImageTag = Static<typeof imageTagSchema>
export const imageTagValidator = getValidator(imageTagSchema, dataValidator)
export const imageTagResolver = resolve<ImageTag, HookContext<ImageTagService>>({})

export const imageTagExternalResolver = resolve<ImageTag, HookContext<ImageTagService>>({})

// Schema for creating new entries
export const imageTagDataSchema = Type.Pick(imageTagSchema, ['image', 'tagId', 'userId'], {
  $id: 'ImageTagData'
})
export type ImageTagData = Static<typeof imageTagDataSchema>
export const imageTagDataValidator = getValidator(imageTagDataSchema, dataValidator)
export const imageTagDataResolver = resolve<ImageTag, HookContext<ImageTagService>>({})

// Schema for updating existing entries
export const imageTagPatchSchema = Type.Partial(imageTagSchema, {
  $id: 'ImageTagPatch'
})
export type ImageTagPatch = Static<typeof imageTagPatchSchema>
export const imageTagPatchValidator = getValidator(imageTagPatchSchema, dataValidator)
export const imageTagPatchResolver = resolve<ImageTag, HookContext<ImageTagService>>({})

// Schema for allowed query properties
export const imageTagQueryProperties = Type.Pick(imageTagSchema, ['image', 'tagId', 'id', 'userId'])
export const imageTagQuerySchema = Type.Intersect(
  [
    querySyntax(imageTagQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ImageTagQuery = Static<typeof imageTagQuerySchema>
export const imageTagQueryValidator = getValidator(imageTagQuerySchema, queryValidator)
export const imageTagQueryResolver = resolve<ImageTagQuery, HookContext<ImageTagService>>({})
