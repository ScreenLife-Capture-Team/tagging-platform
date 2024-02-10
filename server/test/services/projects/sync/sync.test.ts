// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../../src/app'

describe('projects/sync service', () => {
  it('registered the service', () => {
    const service = app.service('projects/sync')

    assert.ok(service, 'Registered the service')
  })

  it.only('can sync', async () => {
    const service = app.service('projects/sync')
    await service.create({ text: '' })
    await app.service('sessions/sync').create({ participantId: 'participant-1' })

    const res = await app.service('sessions').find({ query: { participantId: 'participant-1', index: 0 } })
    const data = await app.service('images').get(res.data?.[0]?.images?.[0]?.id)
    console.log('data', data)
  })
})
