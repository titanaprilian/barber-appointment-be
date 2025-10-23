import { type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('payments')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('appointment_id', 'numeric', (col) => col.notNull().references('appointments.id').onDelete('cascade'))
    .addColumn('amount', 'numeric', (col) => col.notNull())
    .addColumn('status', 'numeric', (col) => col.notNull())
    .addColumn('payment_method', 'numeric', (col) => col.notNull())
    .addColumn('transaction_id', 'numeric', (col) => col.notNull());
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('payments').execute();
}
