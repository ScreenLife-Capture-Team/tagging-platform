import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('tag', (table) => table.string('color'))
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('tag', (table) => table.dropColumn('color'))
}
