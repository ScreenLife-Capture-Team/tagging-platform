import compose from 'koa-compose'
import * as csv from 'fast-csv'
import { ExportToken, User } from './client'
import { app } from './app'
import { BadRequest, Forbidden, GeneralError } from '@feathersjs/errors'

const tags: Record<number, string> = {}
const getTag = async (id: number) => {
  if (id in tags) return tags[id]
  try {
    const res = await app.service('tags').get(id)
    tags[res.id] = res.name
    return res.name
  } catch (err: any) {
    return undefined
  }
}
const resolveTags = async (ids: number[]): Promise<string[]> => {
  const res = await Promise.all(ids.map(getTag))
  return res.filter((v) => !!v) as string[]
}

export const writeDataToStream = async (
  stream: csv.CsvFormatterStream<csv.FormatterRow, csv.FormatterRow>,
  token: ExportToken
) => {
  const knex = app.get('sqliteClient')

  if (!token) throw new Forbidden()
  let data: any = {}
  try {
    data = JSON.parse(token.query)
  } catch (err: any) {
    throw new BadRequest(err)
  }

  const participantId = data.participantId
  if (!participantId) throw new BadRequest('Missing participantId')

  const projectId = (await knex.table('participant').where('id', participantId).first().select('projectId'))
    .projectId

  const collabIds = (await knex.table('project-access').where('projectId', projectId).select('userId')).map(
    (d) => d.userId
  ) as string[]

  const collabs = (
    await Promise.all(
      collabIds.map(async (c) => {
        try {
          return await app.service('users').get(c)
        } catch (err: any) {
          return null
        }
      })
    )
  ).filter((v) => !!v) as User[]

  const admins = await app.service('users').find({ query: { type: 'admin' }, paginate: false })
  const users = [...admins, ...collabs]

  // write headers
  stream.write(['', ...users.map((c) => `${c.email} (id:${c.id})`)])

  try {
    let page = 0
    const size = 1
    let seenNum = 0
    while (true) {
      console.log('on page', page)

      const imageNames = []
      const imageTags: Record<string, string[][]> = {}
      for (const user of users) {
        const session = await app.service('sessions').find({ query: { index: page, participantId }, user })
        const images = session?.data?.[0]?.images || []

        for (const image of images) {
          if (!image.name) throw new GeneralError('image name missing')
          if (!(image.name in imageTags)) {
            imageNames.push(image.name)
            imageTags[image.name] = []
          }
          imageTags[image.name].push(await resolveTags(image.tagIds))
        }
      }

      if (imageNames.length === 0) break

      seenNum += imageNames.length
      page += 1

      for (const imageName of imageNames) {
        const arr = await Promise.all(
          ['', ...users].map(async (c, i) => {
            if (c === '') return imageName
            return imageTags[imageName][i - 1]
          })
        )
        stream.write(arr)
      }
    }
    stream.end()
    console.log('done')
  } catch (error) {
    console.error('Error exporting CSV:', error)
  } finally {
  }
}
