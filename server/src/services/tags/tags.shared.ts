// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Tag, TagData, TagPatch, TagQuery, TagService } from './tags.class'

export type { Tag, TagData, TagPatch, TagQuery }

export type TagClientService = Pick<TagService<Params<TagQuery>>, (typeof tagMethods)[number]>

export const tagPath = 'tags'

export const tagMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const tagClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(tagPath, connection.service(tagPath), {
    methods: tagMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [tagPath]: TagClientService
  }
}
