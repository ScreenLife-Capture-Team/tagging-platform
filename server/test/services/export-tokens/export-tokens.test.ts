// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('export-tokens service', () => {
  it('registered the service', () => {
    const service = app.service('export-tokens')

    assert.ok(service, 'Registered the service')
  })
})
