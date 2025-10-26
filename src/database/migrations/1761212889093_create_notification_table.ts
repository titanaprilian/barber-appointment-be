import { type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('Notification')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'serial', (col) => col.notNull().references('User.id').onDelete('cascade'))
    .addColumn('appointment_id', 'serial', (col) => col.notNull().references('Appointment.id').onDelete('cascade'))
    .addColumn('type', 'varchar(50)', (col) => col.notNull())
    .addColumn('message', 'text')
    .addColumn('is_read', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('Notification').execute();
}
