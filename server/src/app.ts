// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import {
  koa,
  rest,
  bodyParser,
  errorHandler,
  parseAuthentication,
  cors,
  serveStatic,
  authenticate,
  Middleware
} from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

import { configurationValidator } from './configuration'
import type { Application, HookContext, NextFunction } from './declarations'
import { logError } from './hooks/log-error'
import { sqlite } from './sqlite'
import { authentication } from './authentication'
import { services } from './services/index'
import { channels } from './channels'
import { logger } from './logger'
import compose from 'koa-compose'
import { writeDataToStream } from './csv-export'
import * as csv from 'fast-csv'
import { nanoid } from 'nanoid'

const exporter: Middleware = compose([
  async (ctx, next) => {
    if (!ctx.url.startsWith('/export')) {
      await next()
    }

    const token = ctx.url.replace('/export/', '')
    // console.log('token', token)
    if (!token) return

    const exportTokens = await app.service('export-tokens').find({ query: { token } })
    // console.log('exportTokens', exportTokens)
    if (!exportTokens.total) return

    let data: any = {}
    try {
      data = JSON.parse(exportTokens.data[0].query)
    } catch (err: any) {}
    const participantId = data.participantId

    ctx.res.setHeader('Content-Type', 'text/csv')
    ctx.res.setHeader('Content-Disposition', `attachment; filename=${participantId}.csv`)
    ctx.res.setHeader('Transfer-Encoding', 'chunked')

    const csvStream = csv.format({ headers: true })
    ctx.body = csvStream

    writeDataToStream(csvStream, exportTokens.data[0])
  }
])

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware
app.use(cors({ origin: async () => 'http://localhost:3000' }))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

app.use(exporter)

app.use(
  compose([
    async (ctx, next) => {
      if (ctx.url.includes('IMAGEID:')) {
        const knex = app.get('sqliteClient')
        const imageId = ctx.url.split('IMAGEID:')[1]
        const data = (await knex.table('image').where('id', imageId).select('path'))?.[0]

        if (data) ctx.url = data.path.replace('../../', '')
      }

      await next()
    },
    authenticate({ strategies: ['jwt'] }),
    serveStatic('../../')
  ])
)

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(sqlite)
app.configure(authentication)
app.configure(services)
app.configure(channels)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [
    async (context: HookContext, next: NextFunction) => {
      await _populate()
      await _sync()
      await next()
    }
  ],
  teardown: []
})

const _populate = async () => {
  if ((await app.service('users').find()).total === 0) {
    const password = nanoid()
    console.log('\n==================================================')
    console.log('Creating admin user with the following credentials:')
    console.log('email: admin@screenlife.com')
    console.log('password:', password)
    console.log('==================================================\n')

    await app.service('users').create({
      email: 'admin@screenlife.com',
      type: 'admin',
      password
    })
  }
}

const _sync = async () => {
  await app.service('projects/sync').create({ text: '' })
  const projects = await app.service('projects').find({ paginate: false })
  for (const proj of projects) {
    for (const part of proj.participants) {
      await app.service('sessions/sync').create({ participantId: part.id })
    }
  }
}

export { app }
