// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Session, SessionData, SessionPatch, SessionQuery, SessionService } from './sessions.class'

export type { Session, SessionData, SessionPatch, SessionQuery }

export type SessionClientService = Pick<SessionService<Params<SessionQuery>>, (typeof sessionMethods)[number]>

export const sessionPath = 'sessions'

export const sessionMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const sessionClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(sessionPath, connection.service(sessionPath), {
    methods: sessionMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [sessionPath]: SessionClientService
  }
}
