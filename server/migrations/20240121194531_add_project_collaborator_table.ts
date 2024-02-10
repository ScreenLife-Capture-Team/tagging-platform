import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('project-access', (table) => {
    table.increments('id').unique()
    table.integer('userId').references('id').inTable('user')
    table.string('projectId').references('id').inTable('project')
  })
  await knex.schema.table('user', (table) => table.dropColumn('projectIds'))
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('project-access')
  await knex.schema.table('user', (table) => table.string('projectIds'))
}
