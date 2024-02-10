// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('image-tag', (table) => {
    table.increments('id')
    table.integer('tagId')
    table.string('image')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('image-tag')
}
