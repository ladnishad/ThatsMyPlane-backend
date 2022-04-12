import { Pool } from "pg"
import dotenv from 'dotenv'

dotenv.config()

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
})
