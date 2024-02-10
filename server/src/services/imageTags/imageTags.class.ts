// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { ImageTag, ImageTagData, ImageTagPatch, ImageTagQuery } from './imageTags.schema'
import { app } from '../../app'
import { BadRequest, Forbidden, NotAuthenticated } from '@feathersjs/errors'
import * as tf from '@tensorflow/tfjs-node'
import { loadAndPreprocessImage } from '../models/models.class'

export type { ImageTag, ImageTagData, ImageTagPatch, ImageTagQuery }

export interface ImageTagParams extends KnexAdapterParams<ImageTagQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ImageTagService<ServiceParams extends Params = ImageTagParams> extends KnexService<
  ImageTag,
  ImageTagData,
  ImageTagParams,
  ImageTagPatch
> {
  async tagImages(
    data: { imageIds: string[]; tagId: number; action: 'add' | 'remove'; asUser?: number },
    _params?: Params
  ) {
    let userId = _params?.user?.id
    if (data.asUser) {
      if (_params?.user?.type !== 'admin') throw new Forbidden()
      const user = await app.service('users').get(data.asUser)
      userId = user.id
    }
    if (!userId) throw new NotAuthenticated()

    if (data.action === 'add') {
      const knex = app.get('sqliteClient')
      const imageNames: string[] = await Promise.all(
        data.imageIds.map(async (imageId) => {
          return (await knex.table('image').where({ id: imageId }).select('name'))?.[0]?.name
        })
      )
      const existing = (
        await app.service('imageTags').find({
          query: { tagId: data.tagId, image: { $in: imageNames }, userId, $select: ['image'] },
          paginate: false
        })
      ).map((e) => e.image)
      await Promise.all(
        imageNames.map(async (image) => {
          if (existing.includes(image)) return
          await app.service('imageTags').create({
            image,
            tagId: data.tagId,
            userId: userId as number
          })
        })
      )
    }
    if (data.action === 'remove') {
      const knex = app.get('sqliteClient')
      const imageNames: string[] = await Promise.all(
        data.imageIds.map(async (imageId) => {
          return (await knex.table('image').where({ id: imageId }).select('name'))?.[0]?.name
        })
      )
      const existing = (
        await app.service('imageTags').find({
          query: { tagId: data.tagId, image: { $in: imageNames }, userId, $select: ['id'] },
          paginate: false
        })
      ).map((e) => e.id)
      await Promise.all(
        existing.map(async (id) => {
          await app.service('imageTags').remove(id)
        })
      )
    }
    return {}
  }

  async autoTagImages(data: { imageIds: string[]; asUser?: number }, _params?: Params) {
    let userId = _params?.user?.id
    if (data.asUser) {
      if (_params?.user?.type !== 'admin') throw new Forbidden()
      const user = await app.service('users').get(data.asUser)
      userId = user.id
    }
    if (!userId) throw new NotAuthenticated()

    const knex = app.get('sqliteClient')
    const images: { participantId: string; path: string; name: string }[] = await Promise.all(
      data.imageIds.map(async (imageId) => {
        return (
          await knex.table('image').where({ id: imageId }).select(['participantId', 'path', 'name'])
        )?.[0]
      })
    )

    console.log('images', images.length)

    const models = await app.service('models').find()
    if (!models?.[0]) throw new BadRequest('No existing models')
    const model = await tf.loadLayersModel(`file://./models/${models[0].name}/model.json`)

    const imageTags: { image: string; tagId: number }[] = []
    for (const image of images) {
      const imageTensor = await loadAndPreprocessImage(image.path)
      const expandedImageTensor = imageTensor.expandDims(0) // Add batch dimension
      const predictions = model.predict(expandedImageTensor) as tf.Tensor
      const predictedClassIndices = predictions.argMax(-1).dataSync() as Uint8Array

      const tagIds = Array.from(predictedClassIndices)
      tagIds.forEach((tagId) => {
        imageTags.push({ image: image.name, tagId })
      })
    }

    console.log('imageTags', JSON.stringify(imageTags, null, 2))

    await Promise.all(
      imageTags.map(async ({ image, tagId }) => {
        await app.service('imageTags').create({
          image: image,
          tagId: tagId,
          userId: userId as number
        })
      })
    )
    return {}
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'image-tag'
  }
}
