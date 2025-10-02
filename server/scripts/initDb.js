import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}
const pool = new Pool({ connectionString })

async function run() {
  try {
    const sql = readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8')
    await pool.query(sql)
    console.log('Database initialized.')
  } catch (e) {
    console.error('Init error:', e)
    process.exit(1)
  } finally {
    await pool.end()
  }
}
run()
