// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  SessionsSync,
  SessionsSyncData,
  SessionsSyncPatch,
  SessionsSyncQuery,
  SessionsSyncService
} from './sync.class'

export type { SessionsSync, SessionsSyncData, SessionsSyncPatch, SessionsSyncQuery }

export type SessionsSyncClientService = Pick<
  SessionsSyncService<Params<SessionsSyncQuery>>,
  (typeof sessionsSyncMethods)[number]
>

export const sessionsSyncPath = 'sessions/sync'

export const sessionsSyncMethods = ['create'] as const

export const sessionsSyncClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(sessionsSyncPath, connection.service(sessionsSyncPath), {
    methods: sessionsSyncMethods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [sessionsSyncPath]: SessionsSyncClientService
  }
}
