// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../../declarations'
import type { ProjectsSync, ProjectsSyncData, ProjectsSyncPatch, ProjectsSyncQuery } from './sync.schema'
import { readdirSync, lstatSync, existsSync, readFileSync } from 'fs'
import { logger } from '../../../logger'
import { app } from '../../../app'
import path from 'path'

export type { ProjectsSync, ProjectsSyncData, ProjectsSyncPatch, ProjectsSyncQuery }

export interface ProjectsSyncServiceOptions {
  app: Application
}

export interface ProjectsSyncParams extends Params<ProjectsSyncQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ProjectsSyncService<ServiceParams extends ProjectsSyncParams = ProjectsSyncParams>
  implements ServiceInterface<ProjectsSync, ProjectsSyncData, ServiceParams, ProjectsSyncPatch>
{
  constructor(public options: ProjectsSyncServiceOptions) {}

  async create(data: ProjectsSyncData, params?: ServiceParams): Promise<ProjectsSync> {
    // Look through potential project locations, find project.jsons
    const projectPaths: string[] = []
    for (const location of app.get('projectFolderLocations') || []) {
      logger.info(`PSYNC: Syncing with project folder location: ${location}`)
      const items = readdirSync(location)

      const folders = items.filter((item) => lstatSync(path.join(location, item)).isDirectory())
      logger.debug(`PSYNC: Found folders: ${folders.join(', ')}`)

      const foldersWithProjectJson = folders.filter((item) =>
        existsSync(path.join(location, item, 'project.json'))
      )
      logger.debug(`PSYNC: Found folders with project.json: ${foldersWithProjectJson.join(', ')}`)
      projectPaths.push(...foldersWithProjectJson.map((item) => path.join(location, item)))
    }

    // Parse each project folder
    const projects: { id?: string; path: string; participants: { id?: string; path: string }[] }[] = []
    for (const projectPath of projectPaths) {
      logger.info(`PSYNC: Searching for participants in : ${projectPath}`)

      const items = readdirSync(projectPath)

      const folders = items.filter((item) => lstatSync(path.join(projectPath, item)).isDirectory())
      logger.debug(`PSYNC: Found folders: ${folders.join(', ')}`)

      const foldersWithParticipantJson = folders.filter((item) =>
        existsSync(path.join(projectPath, item, 'participant.json'))
      )
      logger.debug(`PSYNC: Found folders with participant.json: ${foldersWithParticipantJson.join(', ')}`)
      const participantPaths = [...foldersWithParticipantJson.map((item) => path.join(projectPath, item))]

      logger.debug(`PSYNC: Parsing: ${projectPath}`)
      let projectId: string | undefined
      try {
        const projectJsonData = JSON.parse(readFileSync(path.join(projectPath, 'project.json')).toString())
        projectId = projectJsonData?.projectId
        logger.debug(`PSYNC: ProjectId found: ${projectId}`)
      } catch (err) {
        logger.debug(`PSYNC: ProjectId error: ${JSON.stringify(err)}`)
      }

      const participants = participantPaths.map((participantPath) => {
        logger.debug(`PSYNC: Parsing: ${participantPath}`)
        let participantId: string | undefined
        try {
          const participantJsonData = JSON.parse(
            readFileSync(path.join(participantPath, 'participant.json')).toString()
          )
          participantId = participantJsonData?.participantId
          logger.debug(`PSYNC: ParticipantId found: ${participantId}`)
        } catch (err) {
          logger.debug(`PSYNC: ParticipantId error: ${JSON.stringify(err)}`)
        }

        return { id: participantId, path: participantPath }
      })

      projects.push({ id: projectId, path: projectPath, participants })
    }

    logger.info(`projects: ${JSON.stringify(projects)}`)

    // Update the DB
    // NOTE: Projects / Participants without IDs will be skipped
    const knex = app.get('sqliteClient')
    for (const project of projects.filter((p) => p.id)) {
      // Update the path of the project if it exists, or add it
      if ((await knex.table('project').where({ id: project.id })).length === 0) {
        await knex.table('project').insert({ id: project.id, name: '', path: project.path })
      } else {
        await knex.table('project').update({ path: project.path }).where({ id: project.id })
      }

      for (const participant of project.participants.filter((p) => p.id)) {
        // Update the path / projectId of the participant if it exists, or add it
        if ((await knex.table('participant').where({ id: participant.id })).length === 0) {
          await knex
            .table('participant')
            .insert({ id: participant.id, path: project.path, projectId: project.id })
        } else {
          await knex
            .table('participant')
            .update({ path: participant.path, projectId: project.id })
            .where({ id: participant.id })
        }
      }
    }

    return {
      id: 0,
      ...data
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
