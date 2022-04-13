import express from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { routes } from "./routes/appRoutes";

import { createUsers } from "./migration/createUsers"
import { ImportAirports } from "./migration/importAirports"
import { ImportAirlines } from "./migration/importAirlines"

dotenv.config();

const app = express();

mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})


app.use(
  bodyparser.urlencoded({
    extended: true
  })
);

app.use(bodyparser.json());

app.use(cors());

routes(app);

app.listen(process.env.SERVER_PORT, async() => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);

  // Run to create users
  // console.log("Creating user(s)")
  // await createUsers()
  // console.log("Finished creating users")

  // Run to ingest airports data (Just USA for now)
  // console.log("Initiating Airports Data load")
  // await ImportAirports()
  // console.log("Finished Airports Data Load")

  // Run to ingest airlines data (Just USA for now)
  // console.log("Initiating Airlines Data load")
  // await ImportAirlines()
  // console.log("Finished Airlines Data Load")
});
