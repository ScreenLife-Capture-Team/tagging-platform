// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tagset', (table) => {
    table.increments('id').unique()
    table.string('name').primary().unique()
  })
  await knex.schema.createTable('tag', (table) => {
    table.increments('id').unique()
    table.integer('tagsetId').references('id').inTable('tagset')
    table.string('name')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tagset')
  await knex.schema.dropTable('tag')
}
