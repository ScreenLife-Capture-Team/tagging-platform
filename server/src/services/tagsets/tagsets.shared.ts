// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Tagset, TagsetData, TagsetPatch, TagsetQuery, TagsetService } from './tagsets.class'

export type { Tagset, TagsetData, TagsetPatch, TagsetQuery }

export type TagsetClientService = Pick<TagsetService<Params<TagsetQuery>>, (typeof tagsetMethods)[number]>

export const tagsetPath = 'tagsets'

export const tagsetMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const tagsetClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(tagsetPath, connection.service(tagsetPath), {
    methods: tagsetMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [tagsetPath]: TagsetClientService
  }
}
