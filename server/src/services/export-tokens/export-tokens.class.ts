// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { ExportToken, ExportTokenData, ExportTokenPatch, ExportTokenQuery } from './export-tokens.schema'

export type { ExportToken, ExportTokenData, ExportTokenPatch, ExportTokenQuery }

export interface ExportTokenParams extends KnexAdapterParams<ExportTokenQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ExportTokenService<ServiceParams extends Params = ExportTokenParams> extends KnexService<
  ExportToken,
  ExportTokenData,
  ExportTokenParams,
  ExportTokenPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'export-token'
  }
}
