// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Project, ProjectData, ProjectPatch, ProjectQuery } from './projects.schema'
import { Knex } from 'knex'

export type { Project, ProjectData, ProjectPatch, ProjectQuery }

export interface ProjectParams extends KnexAdapterParams<ProjectQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ProjectService<ServiceParams extends Params = ProjectParams> extends KnexService<
  Project,
  ProjectData,
  ProjectParams,
  ProjectPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'project'
  }
}
