import { type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('notifications')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'numeric', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('appointment_id', 'numeric', (col) => col.notNull().references('appointments.id').onDelete('cascade'))
    .addColumn('type', 'varchar(50)', (col) => col.notNull())
    .addColumn('message', 'text')
    .addColumn('is_read', 'boolean', (col) => col.notNull().defaultTo(false));
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('notifications').execute();
}
