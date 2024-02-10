// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  ExportToken,
  ExportTokenData,
  ExportTokenPatch,
  ExportTokenQuery,
  ExportTokenService
} from './export-tokens.class'

export type { ExportToken, ExportTokenData, ExportTokenPatch, ExportTokenQuery }

export type ExportTokenClientService = Pick<
  ExportTokenService<Params<ExportTokenQuery>>,
  (typeof exportTokenMethods)[number]
>

export const exportTokenPath = 'export-tokens'

export const exportTokenMethods = ['create'] as const

export const exportTokenClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(exportTokenPath, connection.service(exportTokenPath), {
    methods: exportTokenMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [exportTokenPath]: ExportTokenClientService
  }
}
