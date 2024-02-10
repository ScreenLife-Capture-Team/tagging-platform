// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Tag, TagData, TagPatch, TagQuery } from './tags.schema'

export type { Tag, TagData, TagPatch, TagQuery }

export interface TagParams extends KnexAdapterParams<TagQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class TagService<ServiceParams extends Params = TagParams> extends KnexService<
  Tag,
  TagData,
  TagParams,
  TagPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'tag'
  }
}
