import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/core/db/schema.ts',
  out: './src/core/db/migrations',
  dialect: 'sqlite',
  driver: 'expo', // Using expo as a proxy for the capacitor sqlite approach in drizzle-kit
  dbCredentials: {
    url: 'nyanudge.db',
  },
});
