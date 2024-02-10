// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { modelClient } from './services/models/models.shared'
export type { Model, ModelData, ModelQuery, ModelPatch } from './services/models/models.shared'

import { exportTokenClient } from './services/export-tokens/export-tokens.shared'
export type {
  ExportToken,
  ExportTokenData,
  ExportTokenQuery,
  ExportTokenPatch
} from './services/export-tokens/export-tokens.shared'

import { userClient } from './services/users/users.shared'
export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

import { imageClient } from './services/images/images.shared'
export type { Image, ImageData, ImageQuery, ImagePatch } from './services/images/images.shared'

import { sessionClient } from './services/sessions/sessions.shared'
export type { Session, SessionData, SessionQuery, SessionPatch } from './services/sessions/sessions.shared'

import { sessionsSyncClient } from './services/sessions/sync/sync.shared'
export type {
  SessionsSync,
  SessionsSyncData,
  SessionsSyncQuery,
  SessionsSyncPatch
} from './services/sessions/sync/sync.shared'

import { projectsSyncClient } from './services/projects/sync/sync.shared'
export type {
  ProjectsSync,
  ProjectsSyncData,
  ProjectsSyncQuery,
  ProjectsSyncPatch
} from './services/projects/sync/sync.shared'

import { imageTagClient } from './services/imageTags/imageTags.shared'
export type {
  ImageTag,
  ImageTagData,
  ImageTagQuery,
  ImageTagPatch
} from './services/imageTags/imageTags.shared'

import { tagClient } from './services/tags/tags.shared'
export type { Tag, TagData, TagQuery, TagPatch } from './services/tags/tags.shared'

import { tagsetClient } from './services/tagsets/tagsets.shared'
export type { Tagset, TagsetData, TagsetQuery, TagsetPatch } from './services/tagsets/tagsets.shared'

import { projectClient } from './services/projects/projects.shared'
export type { Project, ProjectData, ProjectQuery, ProjectPatch } from './services/projects/projects.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the screenlife-platform-server app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any,>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(projectClient)
  client.configure(tagsetClient)
  client.configure(tagClient)
  client.configure(imageTagClient)
  client.configure(projectsSyncClient)
  client.configure(sessionsSyncClient)
  client.configure(sessionClient)
  client.configure(imageClient)
  client.configure(userClient)
  client.configure(userClient)
  client.configure(exportTokenClient)
  client.configure(modelClient)
  return client
}
