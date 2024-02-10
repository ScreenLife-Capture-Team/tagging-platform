// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { ImageTag, ImageTagData, ImageTagPatch, ImageTagQuery, ImageTagService } from './imageTags.class'

export type { ImageTag, ImageTagData, ImageTagPatch, ImageTagQuery }

export type ImageTagClientService = Pick<
  ImageTagService<Params<ImageTagQuery>>,
  (typeof imageTagMethods)[number]
>

export const imageTagPath = 'imageTags'

export const imageTagMethods = [
  'find',
  'get',
  'create',
  'patch',
  'remove',
  'tagImages',
  'autoTagImages'
] as const

export const imageTagClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(imageTagPath, connection.service(imageTagPath), {
    methods: imageTagMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [imageTagPath]: ImageTagClientService
  }
}
