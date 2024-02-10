// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { SessionService } from './sessions.class'
import { app } from '../../app'
import { User } from '../users/users.class'
import { BadRequest, Forbidden, NotAuthenticated } from '@feathersjs/errors'

// Main data model schema
export const sessionSchema = Type.Object(
  {
    id: Type.Number(),
    participantId: Type.String(),
    index: Type.Number(),
    startDateTime: Type.Number(),
    endDateTime: Type.Number(),
    numberOfImages: Type.Number(),

    images: Type.Array(
      Type.Object({
        id: Type.String(),
        name: Type.Optional(Type.String()),
        tagIds: Type.Array(Type.Number())
      })
    ),
    sessions: Type.Array(
      Type.Object({
        startDateTime: Type.Number(),
        endDateTime: Type.Number(),
        numberOfImages: Type.Number()
      })
    )
  },
  { $id: 'Session', additionalProperties: false }
)
export type Session = Static<typeof sessionSchema>
export const sessionValidator = getValidator(sessionSchema, dataValidator)
export const sessionResolver = resolve<Session, HookContext<SessionService>>({
  sessions: virtual(async (instance, context) => {
    const knex = app.get('sqliteClient')
    const sessions = await knex
      .table('session')
      .where('participantId', '=', instance.participantId)
      .orderBy('index', 'asc')
      .select('*')
    return sessions.map((s) => ({ ...s, participantId: undefined, index: undefined }))
  }),
  images: virtual(async (instance, context) => {
    const user = context.params.asUser
      ? await app.service('users').get(context.params.asUser)
      : (context.params.user as User)
    const isInternal = !context.params.provider

    if (!isInternal && !user) throw new NotAuthenticated()

    const knex = app.get('sqliteClient')
    const images = await knex
      .table('image')
      .where('timestamp', '>=', instance.startDateTime)
      .where('timestamp', '<=', instance.endDateTime)
      .select('id', 'name')

    const participant = (
      await knex.table('participant').where({ id: instance.participantId }).select('projectId')
    )?.[0]
    const tagsets = await knex
      .table('project-tagset')
      .where({ projectId: participant.projectId })
      .select('tagsetId')
    const includedTags = (
      await Promise.all(
        tagsets.map(async (ts) => {
          return (await knex.table('tag').where({ tagsetId: ts.tagsetId }).select('*')) as {
            id: number
            name: string
          }[]
        })
      )
    )
      .flatMap((ts) => ts)
      .map((t) => t.id)

    return Promise.all(
      images.map(async (image: { id: string; name: string }) => {
        const _tags = (await knex
          .table('image-tag')
          .where('image', image.name)
          .where((builder) => {
            if (user?.id) builder.where('userId', user.id)
          })
          .select('tagId')) as { tagId: number }[]
        const tags = _tags.filter((t) => includedTags.includes(t.tagId)) as { tagId: number }[]

        return {
          id: image.id,
          tagIds: tags.map((t: { tagId: number }) => t.tagId),
          name: isInternal ? image.name : undefined
        }
      })
    ) as any
  })
})

export const sessionExternalResolver = resolve<Session, HookContext<SessionService>>({})

// Schema for creating new entries
export const sessionDataSchema = Type.Pick(sessionSchema, [], {
  $id: 'SessionData'
})
export type SessionData = Static<typeof sessionDataSchema>
export const sessionDataValidator = getValidator(sessionDataSchema, dataValidator)
export const sessionDataResolver = resolve<Session, HookContext<SessionService>>({})

// Schema for updating existing entries
export const sessionPatchSchema = Type.Partial(sessionSchema, {
  $id: 'SessionPatch'
})
export type SessionPatch = Static<typeof sessionPatchSchema>
export const sessionPatchValidator = getValidator(sessionPatchSchema, dataValidator)
export const sessionPatchResolver = resolve<Session, HookContext<SessionService>>({})

// Schema for allowed query properties
export const sessionQueryProperties = Type.Pick(sessionSchema, ['participantId', 'index'])
export const sessionQuerySchema = Type.Intersect(
  [
    querySyntax(sessionQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        asUser: Type.Optional(Type.Number())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type SessionQuery = Static<typeof sessionQuerySchema>
export const sessionQueryValidator = getValidator(sessionQuerySchema, queryValidator)
export const sessionQueryResolver = resolve<SessionQuery, HookContext<SessionService>>({
  asUser: async (value, instance, context) => {
    if (!value) return undefined
    const user = context.params.user as User | undefined
    if (user?.type !== 'admin') throw new Forbidden('Cannot use asUser')
    context.params.asUser = value
    return undefined
  }
})
