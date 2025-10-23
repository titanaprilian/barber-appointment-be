import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    port: Number.parseInt(process.env.PG_PORT || '5432'),
    max: Number.parseInt(process.env.PG_POOL || '10'), // set pool max size to 10
  }),
});

export const db = new Kysely({
  dialect,
});

if (!db.connection()) {
  throw new Error('Failed to connect to database');
}

export default db;
