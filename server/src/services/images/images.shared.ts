// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Image, ImageData, ImagePatch, ImageQuery, ImageService } from './images.class'

export type { Image, ImageData, ImagePatch, ImageQuery }

export type ImageClientService = Pick<ImageService<Params<ImageQuery>>, (typeof imageMethods)[number]>

export const imagePath = 'images'

export const imageMethods = ['find', 'get', 'autoTag'] as const

export const imageClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(imagePath, connection.service(imagePath), {
    methods: imageMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [imagePath]: ImageClientService
  }
}
