// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ImageService } from './images.class'

// Main data model schema
export const imageSchema = Type.Object(
  {
    base64: Type.String()
  },
  { $id: 'Image', additionalProperties: false }
)
export type Image = Static<typeof imageSchema>
export const imageValidator = getValidator(imageSchema, dataValidator)
export const imageResolver = resolve<Image, HookContext<ImageService>>({})

export const imageExternalResolver = resolve<Image, HookContext<ImageService>>({})

// Schema for creating new entries
export const imageDataSchema = Type.Pick(imageSchema, [], {
  $id: 'ImageData'
})
export type ImageData = Static<typeof imageDataSchema>
export const imageDataValidator = getValidator(imageDataSchema, dataValidator)
export const imageDataResolver = resolve<Image, HookContext<ImageService>>({})

// Schema for updating existing entries
export const imagePatchSchema = Type.Partial(imageSchema, {
  $id: 'ImagePatch'
})
export type ImagePatch = Static<typeof imagePatchSchema>
export const imagePatchValidator = getValidator(imagePatchSchema, dataValidator)
export const imagePatchResolver = resolve<Image, HookContext<ImageService>>({})

// Schema for allowed query properties
export const imageQueryProperties = Type.Pick(imageSchema, [])
export const imageQuerySchema = Type.Intersect(
  [
    querySyntax(imageQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ImageQuery = Static<typeof imageQuerySchema>
export const imageQueryValidator = getValidator(imageQuerySchema, queryValidator)
export const imageQueryResolver = resolve<ImageQuery, HookContext<ImageService>>({})
