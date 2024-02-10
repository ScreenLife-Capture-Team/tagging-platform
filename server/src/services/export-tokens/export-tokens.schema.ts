// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ExportTokenService } from './export-tokens.class'
import { customAlphabet } from 'nanoid'
import { Forbidden } from '@feathersjs/errors'
import { addMinutes } from 'date-fns'

// Main data model schema
export const exportTokenSchema = Type.Object(
  {
    id: Type.Number(),
    token: Type.String(),
    query: Type.String(),

    byUser: Type.Number(),
    expiresAt: Type.Number()
  },
  { $id: 'ExportToken', additionalProperties: false }
)
export type ExportToken = Static<typeof exportTokenSchema>
export const exportTokenValidator = getValidator(exportTokenSchema, dataValidator)
export const exportTokenResolver = resolve<ExportToken, HookContext<ExportTokenService>>({})

export const exportTokenExternalResolver = resolve<ExportToken, HookContext<ExportTokenService>>({})

// Schema for creating new entries
export const exportTokenDataSchema = Type.Pick(exportTokenSchema, ['query'], {
  $id: 'ExportTokenData'
})
export type ExportTokenData = Static<typeof exportTokenDataSchema>
export const exportTokenDataValidator = getValidator(exportTokenDataSchema, dataValidator)
export const exportTokenDataResolver = resolve<ExportToken, HookContext<ExportTokenService>>({
  token: async () => customAlphabet('1234567890abcdef')(16),
  byUser: async (value, instance, context) => {
    if (!context.params.user) throw new Forbidden()
    if (context.params.user.type !== 'admin') throw new Forbidden()
    return context.params.user.id
  },
  expiresAt: async () => addMinutes(new Date(), 1).getTime()
})

// Schema for updating existing entries
export const exportTokenPatchSchema = Type.Partial(exportTokenSchema, {
  $id: 'ExportTokenPatch'
})
export type ExportTokenPatch = Static<typeof exportTokenPatchSchema>
export const exportTokenPatchValidator = getValidator(exportTokenPatchSchema, dataValidator)
export const exportTokenPatchResolver = resolve<ExportToken, HookContext<ExportTokenService>>({})

// Schema for allowed query properties
export const exportTokenQueryProperties = Type.Pick(exportTokenSchema, ['id', 'query', 'token', 'expiresAt'])
export const exportTokenQuerySchema = Type.Intersect(
  [
    querySyntax(exportTokenQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ExportTokenQuery = Static<typeof exportTokenQuerySchema>
export const exportTokenQueryValidator = getValidator(exportTokenQuerySchema, queryValidator)
export const exportTokenQueryResolver = resolve<ExportTokenQuery, HookContext<ExportTokenService>>({
  // expiresAt: async () => ({ $gt: Date.now() })
})
