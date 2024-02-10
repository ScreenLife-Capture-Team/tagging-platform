// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Session, SessionData, SessionPatch, SessionQuery } from './sessions.schema'

export type { Session, SessionData, SessionPatch, SessionQuery }

export interface SessionParams extends KnexAdapterParams<SessionQuery> {
  asUser?: number | undefined
}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class SessionService<ServiceParams extends Params = SessionParams> extends KnexService<
  Session,
  SessionData,
  SessionParams,
  SessionPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'session'
  }
}
