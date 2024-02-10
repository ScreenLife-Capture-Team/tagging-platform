// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('projects service', () => {
  before(async () => {
    await app.get('sqliteClient').table('project').del()
    await app.get('sqliteClient').table('participant').del()
  })

  it('registered the service', async () => {
    const service = app.service('projects')

    assert.ok(service, 'Registered the service')
  })

  it('can create w participants', async () => {
    const service = app.service('projects')

    await service.create({
      id: 'project-1',
      name: 'Project 1',
      participants: [{ id: 'part-1' }, { id: 'part-2' }]
    })

    const res = await service.get('project-1')
    assert.equal(res.participants.length, 2)
    assert.equal(res.participants[0].id, 'part-1')
  })
})
