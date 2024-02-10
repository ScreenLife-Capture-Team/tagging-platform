// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Image, ImageData, ImagePatch, ImageQuery } from './images.schema'
import { app } from '../../app'
import { BadRequest } from '@feathersjs/errors'
import { readFile, readFileSync } from 'fs'

import { GoogleAuth } from 'google-auth-library'
import axios from 'axios'

export type { Image, ImageData, ImagePatch, ImageQuery }

export interface ImageServiceOptions {
  app: Application
}

export interface ImageParams extends Params<ImageQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ImageService<ServiceParams extends ImageParams = ImageParams>
  implements ServiceInterface<Image, ImageData, ServiceParams, ImagePatch>
{
  constructor(public options: ImageServiceOptions) {}

  async autoTag({ id }: { id: string }) {
    const auth = new GoogleAuth()
    const token = await auth.getAccessToken()

    const knex = app.get('sqliteClient')
    const image = (await knex.table('image').where({ id }).select('path'))?.[0]
    if (!image) throw new BadRequest(`Cannot find image: ${id}`)

    const fData: Buffer = await new Promise((resolve, reject) => {
      readFile(image.path, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })
    })

    const instances = [{ content: fData.toString('base64') }]

    const url = `https://${app.get('google').apiEndpoint}/v1/projects/${
      app.get('google').projectId
    }/locations/us-central1/endpoints/${app.get('google').endpointId}:predict`

    try {
      const response = await axios.post(url, { instances }, { headers: { Authorization: `Bearer ${token}` } })

      return response
    } catch (err: any) {
      console.error('err', {
        message: err.message,
        name: err.name,
        code: err.code,
        response: err.response
      })
    }
  }

  async find(_params?: ServiceParams): Promise<Image[]> {
    return []
  }

  async get(id: Id, _params?: ServiceParams): Promise<Image> {
    const knex = app.get('sqliteClient')
    const image = (await knex.table('image').where({ id }).select('path'))?.[0]
    if (!image) throw new BadRequest(`Cannot find image: ${id}`)

    return {
      base64: ''
    }

    const data: Buffer = await new Promise((resolve, reject) => {
      readFile(image.path, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })
    })

    return {
      base64: data.toString('base64')
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
