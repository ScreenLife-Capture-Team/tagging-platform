// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../../src/app'

describe('sessions/sync service', () => {
  it('registered the service', () => {
    const service = app.service('sessions/sync')

    assert.ok(service, 'Registered the service')
  })
})
