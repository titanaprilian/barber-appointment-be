import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Service')
    .alterColumn('price', (col) => col.setDataType('numeric(10, 2)'))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Service')
    .alterColumn('price', (col) => col.setDataType('float4'))
    .execute();
}
