//lib/postgres.js
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used in server components or API routes');
}

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: {
    //rejectUnauthorized: false // Required for Render.com PostgreSQL
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export async function connectToDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection established');
    return client;
  } catch (error) {
    console.error('❌ Database connection failed:', {
      message: error.message,
      host: process.env.POSTGRES_HOST,
      code: error.code
    });
    throw new Error(`Database connection failed: ${error.message}`);
  }
}