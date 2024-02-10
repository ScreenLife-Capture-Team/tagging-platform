import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('image-tag', (table) => table.integer('userId').references('id').inTable('user'))
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('image-tag', (table) => table.dropColumn('userId'))
}
