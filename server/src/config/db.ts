import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export const sql = neon(process.env.DATABASE_URL);

export async function testConnection(): Promise<void> {
  const result = await sql`SELECT version() AS version`;
  console.log('[DB] Connected to Neon:', result[0]?.version);
}
