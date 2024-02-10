// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('export-token', (table) => {
    table.increments('id')
    table.string('token')
    table.string('query')
    table.integer('byUser')
    table.integer('expiresAt')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('export-token')
}