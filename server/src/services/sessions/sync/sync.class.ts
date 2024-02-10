// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../../declarations'
import type { SessionsSync, SessionsSyncData, SessionsSyncPatch, SessionsSyncQuery } from './sync.schema'
import { app } from '../../../app'
import { GeneralError } from '@feathersjs/errors'
import { existsSync, lstatSync, opendirSync } from 'fs'
import { nanoid } from 'nanoid'
import { addMinutes, differenceInMinutes, isAfter } from 'date-fns'
import path from 'path'

export type { SessionsSync, SessionsSyncData, SessionsSyncPatch, SessionsSyncQuery }

export interface SessionsSyncServiceOptions {
  app: Application
}

export interface SessionsSyncParams extends Params<SessionsSyncQuery> {}

const filenameToDateTime = (filename: string) => {
  let fname = filename.replace('_decrypted_same', '')
  fname = fname.replace('_decrypted', '')
  const date = fname
  const dC = date.split('_').map((s) => parseInt(s))
  const index = dC.length - 6
  const d = new Date(dC[index], dC[index + 1] - 1, dC[index + 2], dC[index + 3], dC[index + 4], dC[index + 5])
  return d
}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class SessionsSyncService<ServiceParams extends SessionsSyncParams = SessionsSyncParams>
  implements ServiceInterface<SessionsSync, SessionsSyncData, ServiceParams, SessionsSyncPatch>
{
  constructor(public options: SessionsSyncServiceOptions) {}

  async create(data: SessionsSyncData, params?: ServiceParams): Promise<SessionsSync> {
    const { participantId } = data

    const knex = app.get('sqliteClient')

    const participant = (
      await knex
        .table('participant')
        .where({ 'participant.id': participantId })
        .join('project', 'participant.projectId', '=', 'project.id')
        .select('project.minutesBetweenSessions', 'participant.path')
    )?.[0]

    const minutesBetweenSessions = participant?.minutesBetweenSessions || 5
    const participantPath = participant?.path

    if (!participantPath) throw new GeneralError('Cannot find path for participant')
    if (!existsSync(participantPath)) throw new GeneralError('Path for participant does not exist')
    if (!lstatSync(participantPath).isDirectory())
      throw new GeneralError('Path for participant is not a directory')

    // Clear existing image records for this participant
    await knex.table('session').del().where({ participantId })
    await knex.table('image').del().where({ participantId })

    // Add image records
    const files = opendirSync(participantPath)
    for await (const entry of files) {
      if (!entry.isFile()) continue

      const timestamp = filenameToDateTime(entry.name)
      if (timestamp.toString() === 'Invalid Date') continue
      const data = {
        name: entry.name,
        path: path.join(entry.path),
        participantId,
        timestamp,
        id: nanoid()
      }
      await knex.table('image').insert(data)
    }

    const sessions: { start: Date; end: Date; numberOfImages: number }[] = []
    let current: any[] | undefined
    let page = 0
    const pageSize = 1000
    while (!current || current.length > 0) {
      current = await knex
        .table('image')
        .where({ participantId })
        .orderBy('timestamp', 'asc')
        .offset(page * pageSize)
        .limit(pageSize)

      for (const image of current) {
        if (sessions.length === 0) {
          // First entry
          sessions.push({ start: image.timestamp, end: image.timestamp, numberOfImages: 1 })
        } else {
          const session = sessions[sessions.length - 1]
          const withinTime = addMinutes(session.end, minutesBetweenSessions)
          if (isAfter(image.timestamp, withinTime) || session.numberOfImages >= 50) {
            // If new session
            sessions.push({ start: image.timestamp, end: image.timestamp, numberOfImages: 1 })
          } else {
            // If still within current session
            sessions[sessions.length - 1].end = image.timestamp
            sessions[sessions.length - 1].numberOfImages = session.numberOfImages + 1
          }
        }
      }

      page += 1
    }

    for (const index in sessions) {
      const session = sessions[index]
      await knex.table('session').insert({
        participantId,
        index,
        startDateTime: session.start,
        endDateTime: session.end,
        numberOfImages: session.numberOfImages
      })
    }

    return {
      text: '',
      id: 0,
      ...data
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
