import { defineConfig } from "kysely-ctl";

import { db } from "./src/database";
/**
 * Configuration for Kysely CLI and runtime functionality.
 *
 * This file exports the configuration used by Kysely to manage database
 * connections, migrations, and seed data.
 *
 * @module kysely.config
 *
 * @property {Kysely<DB>} kysely - The Kysely database instance to use for operations
 * @property {Object} migrations - Migration configuration options
 * @property {string} migrations.migrationFolder - Path to the folder containing migration files
 * @property {Object} seeds - Seed configuration options
 * @property {string} seeds.seedFolder - Path to the folder containing seed files
 *
 * @see https://kysely.dev/docs/migrations
 */
export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: "./src/database/migrations",
  },
  seeds: {
    seedFolder: "./src/database/seeds",
  },
});
