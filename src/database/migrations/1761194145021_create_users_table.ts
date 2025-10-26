import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('User')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('email', 'varchar(100)')
    .addColumn('password', 'varchar(255)', (col) => col.notNull())
    .addColumn('role', 'varchar(50)', (col) =>
      col
        .notNull()
        .defaultTo('customer')
        .check(sql`role in ('customer', 'barber', 'admin')`)
    )
    .addColumn('phone', 'varchar(20)', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('User').execute();
}
