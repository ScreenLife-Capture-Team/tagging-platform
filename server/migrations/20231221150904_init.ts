import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user', function (table) {
    table.increments('id').primary().unique()
    table.string('email')
    table.string('password')
    table.string('type')
  })

  await knex.schema.createTable('project', function (table) {
    table.string('id').primary().unique()
    table.string('name')
    table.string('path')
    table.integer('minutesBetweenSessions')
  })
  await knex.schema.createTable('participant', function (table) {
    table.string('id').primary().unique()
    table.string('projectId').references('id').inTable('project')
    table.string('path')
  })
  await knex.schema.createTable('session', function (table) {
    table.increments('id').primary().unique()
    table.string('participantId').references('id').inTable('participant')
    table.integer('index')

    table.datetime('startDateTime')
    table.datetime('endDateTime')
    table.integer('numberOfImages')

    table.unique(['participantId', 'index'])
  })
  await knex.schema.createTable('image', function (table) {
    table.string('id').primary().unique()
    table.string('participantId').references('id').inTable('participant')
    table.string('name')
    table.string('path')
    table.dateTime('timestamp')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user')
  await knex.schema.dropTableIfExists('project')
  await knex.schema.dropTableIfExists('participant')
  await knex.schema.dropTableIfExists('image')
  await knex.schema.dropTableIfExists('session')
}
