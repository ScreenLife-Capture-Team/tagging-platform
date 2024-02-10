import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('project-tagset', (table) => {
    table.increments('id').unique()
    table.integer('tagsetId').references('id').inTable('tagset')
    table.string('projectId').references('id').inTable('project')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('project-tagset')
}
