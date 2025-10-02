import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function query(text, params) {
  return await pool.query(text, params)
}

export async function tx(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
