import express from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import { checkJwtAuth } from "./middlewares/auth"
import { routes } from "./routes/appRoutes";

import { createUsers } from "./migration/createUsers"
import { ImportAirports, AddGeoLocationFromDbBackup } from "./migration/importAirports"
import { ImportAirlines } from "./migration/importAirlines"
import { ImportAircraftsTypes } from "./migration/importAircraftTypes"

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

app.use(checkJwtAuth);

app.use(cors({
  origin: 'http://localhost:3000'
}));

routes(app);

app.listen(process.env.SERVER_PORT, async() => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);

  // Run to create users
  // console.log("Creating user(s)")
  // await createUsers()
  // console.log("Finished creating users")

  // Run to ingest airports data (Just USA for now)
  // await ImportAirports()

  // Run to update lat long format to utilize geospatial from MongoDB
  // await AddGeoLocationFromDbBackup()

  // Run to ingest airlines data (Just USA for now)
  // console.log("Initiating Airlines Data load")
  // await ImportAirlines()
  // console.log("Finished Airlines Data Load")

  // Run to ingest aircraft types data
  // await ImportAircraftsTypes()
});
