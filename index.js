import express from 'express'
import mongoose from 'mongoose'
import bodyparser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool } from "./dbConnection"
import { routes } from "./routes/appRoutes"

dotenv.config()

const app = express()

app.use(bodyparser.urlencoded({
  extended: true
}))

app.use(bodyparser.json())

app.use(cors())

routes(app)

app.listen(process.env.SERVER_PORT, () => {
  console.log("Server running on port 3000")
})
