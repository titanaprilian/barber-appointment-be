import { type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('Availability')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('barber_id', 'serial', (col) => col.notNull().references('User.id').onDelete('cascade'))
    .addColumn('day_of_week', 'numeric', (col) => col.notNull())
    .addColumn('start_time', 'time', (col) => col.notNull())
    .addColumn('end_time', 'time', (col) => col.notNull())
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('Availability').execute();
}
