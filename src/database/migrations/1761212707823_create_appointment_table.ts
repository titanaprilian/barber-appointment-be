import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('appointments')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('customer_id', 'numeric', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('barber_id', 'numeric', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('service_id', 'numeric', (col) => col.notNull().references('services.id').onDelete('cascade'))
    .addColumn('date', 'timestamp', (col) => col.notNull())
    .addColumn('start_time', 'time', (col) => col.notNull())
    .addColumn('end_time', 'time', (col) => col.notNull())
    .addColumn('status', 'varchar(50)', (col) =>
      col
        .notNull()
        .defaultTo('booked')
        .check(sql`status in ('booked', 'completed', 'cancelled')`)
    );
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('appointments').execute();
}
