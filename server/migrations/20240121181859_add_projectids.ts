import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('user', (table) => table.string('projectIds'))
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('user', (table) => table.dropColumn('projectIds'))
}
