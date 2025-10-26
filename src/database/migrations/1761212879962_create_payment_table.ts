import { type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('Payment')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('appointment_id', 'serial', (col) => col.notNull().references('Appointment.id').onDelete('cascade'))
    .addColumn('amount', 'numeric', (col) => col.notNull())
    .addColumn('status', 'numeric', (col) => col.notNull())
    .addColumn('payment_method', 'numeric', (col) => col.notNull())
    .addColumn('transaction_id', 'numeric', (col) => col.notNull())
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('Payment').execute();
}
