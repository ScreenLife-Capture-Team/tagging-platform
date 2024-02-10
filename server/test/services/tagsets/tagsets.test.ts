// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('tagsets service', () => {
  before(async () => {
    await app.get('sqliteClient').table('tagset').del()
    await app.get('sqliteClient').table('tag').del()
  })

  it('registered the service', () => {
    const service = app.service('tagsets')

    assert.ok(service, 'Registered the service')
  })

  it('can create tagset', async () => {
    const service = app.service('tagsets')

    const res = await service.create({ name: 'mood' })
    assert.equal(res.name, 'mood')
  })

  it('can create tags', async () => {
    const service = app.service('tagsets')

    const ts = await service.create({ name: 'mood2' })

    await app.service('tags').create({
      tagsetId: ts.id,
      name: 'happy'
    })
    await app.service('tags').create({
      tagsetId: ts.id,
      name: 'sad'
    })

    const res = await app.service('tags').find({ query: { tagsetId: ts.id } })
    assert.equal(res.total, 2)
    console.log('res', res)
  })

  it('can create tags w same id accross different sets', async () => {
    const service = app.service('tagsets')

    const ts1 = await service.create({ name: 'mood3' })
    const ts2 = await service.create({ name: 'mood4' })

    await app.service('tags').create({
      tagsetId: ts1.id,
      name: 'angry'
    })
    await app.service('tags').create({
      tagsetId: ts2.id,
      name: 'angry'
    })

    const res = await app.service('tags').find({ query: { tagsetId: ts1.id } })
    assert.equal(res.total, 1)
  })
})
