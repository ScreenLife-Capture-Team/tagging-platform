// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ProjectService } from './projects.class'
import { app } from '../../app'
import { BadRequest, Forbidden, NotAuthenticated } from '@feathersjs/errors'
import { User } from '../users/users.class'

// Main data model schema
export const projectSchema = Type.Object(
  {
    id: Type.RegEx(/[0-9a-z-_]+/),
    name: Type.String(),
    path: Type.Optional(Type.String()),

    tagsetIds: Type.Array(Type.Number()),
    participants: Type.Array(
      Type.Object({
        id: Type.RegEx(/[0-9a-z-_]+/)
      })
    ),
    collaborators: Type.Array(
      Type.Object({
        id: Type.Number(),
        email: Type.String()
      })
    )
  },
  { $id: 'Project', additionalProperties: false }
)
export type Project = Static<typeof projectSchema>
export const projectValidator = getValidator(projectSchema, dataValidator)
export const projectResolver = resolve<Project, HookContext<ProjectService>>({
  participants: virtual(async (instance, context) => {
    const knex = app.get('sqliteClient')
    return knex.table('participant').where({ projectId: instance.id })
  }),
  collaborators: virtual(async (instance, context) => {
    const knex = app.get('sqliteClient')
    const collaborators = await knex
      .table('project-access')
      .where({ projectId: instance.id })
      .select('userId')

    return Promise.all(
      collaborators.map(
        async (c) => await knex.table('user').where('id', c.userId).first().select('id', 'email')
      )
    )
  }),
  tagsetIds: virtual(async (instance, context) => {
    const knex = app.get('sqliteClient')
    const tagsets = await knex.table('project-tagset').where({ projectId: instance.id }).select('*')

    return tagsets.map((v) => v.tagsetId)
  })
})

export const projectExternalResolver = resolve<Project, HookContext<ProjectService>>({})

// Schema for creating new entries
export const projectDataSchema = Type.Pick(projectSchema, ['id', 'name', 'participants'], {
  $id: 'ProjectData'
})
export type ProjectData = Static<typeof projectDataSchema>
export const projectDataValidator = getValidator(projectDataSchema, dataValidator)

export const projectPreDataResolver = resolve<Project, HookContext<ProjectService>>({
  id: async (value) => {
    if (!value) throw new BadRequest('Missing ID')
    const cleaned = value.toLowerCase().replace(/[^0-9A-Z-_]+/gi, '')
    return cleaned
  }
})

export const projectDataResolver = resolve<Project, HookContext<ProjectService>>({
  participants: async (value, instance, context) => {
    const transaction = context.params.transaction
    const knex = transaction?.trx || app.get('sqliteClient')

    await knex.table('participant').where({ projectId: instance.id }).del()

    try {
      await Promise.all(
        (value || [])?.map((v) => {
          const cleaned = v.id.toLowerCase().replace(/[^0-9A-Z-_]+/gi, '')
          return knex.table('participant').insert({ projectId: instance.id, id: cleaned })
        })
      )
    } catch (err: any) {
      throw new BadRequest('Invalid participants array', err)
    }

    return undefined
  },
  tagsetIds: async (value, instance, context) => {
    const transaction = context.params.transaction
    const knex = transaction?.trx || app.get('sqliteClient')

    await knex.table('project-tagset').where({ projectId: instance.id }).del()

    try {
      await Promise.all(
        (value || [])?.map((v) => {
          return knex.table('project-tagset').insert({ projectId: instance.id, tagsetId: v })
        })
      )
    } catch (err: any) {
      throw new BadRequest('Invalid tagsets array', err)
    }

    return undefined
  }
})

// Schema for updating existing entries
export const projectPatchSchema = Type.Partial(Type.Omit(projectSchema, ['id']), {
  $id: 'ProjectPatch'
})
export type ProjectPatch = Static<typeof projectPatchSchema>
export const projectPatchValidator = getValidator(projectPatchSchema, dataValidator)
export const projectPatchResolver = resolve<Project, HookContext<ProjectService>>({
  tagsetIds: async (value, instance, context) => {
    const transaction = context.params.transaction
    const knex = transaction?.trx || app.get('sqliteClient')

    await knex.table('project-tagset').where({ projectId: context.id }).del()

    try {
      await Promise.all(
        (value || [])?.map((v) => {
          return knex.table('project-tagset').insert({ projectId: context.id, tagsetId: v })
        })
      )
    } catch (err: any) {
      throw new BadRequest('Invalid tagsets array', err)
    }

    return undefined
  },
  name: async (value, instance, context) => {
    const transaction = context.params.transaction
    const knex = transaction?.trx || app.get('sqliteClient')
    return value || (await knex.table('project').where({ id: context.id! }).select('name'))?.[0].name
  }
})

// Schema for allowed query properties
export const projectQueryProperties = Type.Pick(projectSchema, ['id', 'name'])
export const projectQuerySchema = Type.Intersect(
  [
    querySyntax(projectQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ProjectQuery = Static<typeof projectQuerySchema>
export const projectQueryValidator = getValidator(projectQuerySchema, queryValidator)
export const projectQueryResolver = resolve<ProjectQuery, HookContext<ProjectService>>({
  id: async (value, instance, context) => {
    if (!context.params.provider) return value

    const user = context.params.user as User | undefined
    if (!user) throw new NotAuthenticated()

    if (user.type === 'admin') return value

    return { $in: user.projectIds }
  }
})
