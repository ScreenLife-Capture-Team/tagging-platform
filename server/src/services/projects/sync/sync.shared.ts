// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../../client'
import type {
  ProjectsSync,
  ProjectsSyncData,
  ProjectsSyncPatch,
  ProjectsSyncQuery,
  ProjectsSyncService
} from './sync.class'

export type { ProjectsSync, ProjectsSyncData, ProjectsSyncPatch, ProjectsSyncQuery }

export type ProjectsSyncClientService = Pick<
  ProjectsSyncService<Params<ProjectsSyncQuery>>,
  (typeof projectsSyncMethods)[number]
>

export const projectsSyncPath = 'projects/sync'

export const projectsSyncMethods = ['create'] as const

export const projectsSyncClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(projectsSyncPath, connection.service(projectsSyncPath), {
    methods: projectsSyncMethods
  })
}

// Add this service to the client service type index
declare module '../../../client' {
  interface ServiceTypes {
    [projectsSyncPath]: ProjectsSyncClientService
  }
}
