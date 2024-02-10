// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Tagset, TagsetData, TagsetPatch, TagsetQuery } from './tagsets.schema'

export type { Tagset, TagsetData, TagsetPatch, TagsetQuery }

export interface TagsetParams extends KnexAdapterParams<TagsetQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class TagsetService<ServiceParams extends Params = TagsetParams> extends KnexService<
  Tagset,
  TagsetData,
  TagsetParams,
  TagsetPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'tagset'
  }
}
