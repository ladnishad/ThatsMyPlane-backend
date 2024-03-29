import http from "http";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import socketio from "socket.io";
import { createClient } from "redis";

import PassportConfig from "./middlewares/auth";
import credentials from "./middlewares/credentials";
import handleSocket from "./middlewares/subscriptions";
import { routes } from "./routes/appRoutes";
import CorsOptions from "./config/corsOptions";
import AllowedOrigins from "./config/allowedOrigins";
import { createUsers } from "./migration/createUsers";
import {
  ImportAirports,
  AddGeoLocationFromDbBackup,
} from "./migration/importAirports";
import { removeDuplicateAirports } from "./migration/removeDuplicateAirports";
import { ImportAirlines } from "./migration/importAirlines";
import { ImportAircraftsTypes } from "./migration/importAircraftTypes";
import { ImportUserFlights } from "./migration/importUserFlights";

dotenv.config();

// PassportConfig(passport)
const app = express();

const DB_LINK =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_DB_LINK
    : process.env.DEV_DB_LINK;
mongoose.connect(DB_LINK, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const RedisClient = createClient({
  url: process.env.REDIS_URL,
});

RedisClient.on("error", (error) => console.error(`Error : ${error}`));

RedisClient.on("ready", () => console.log("Connected successfully to redis"));

RedisClient.connect();

process.on("SIGINT", function () {
  RedisClient.quit();
  console.log("Terminated Redis connection");
});

app.use(credentials);

app.use(cors(CorsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

app.use(function (req, res, next) {
  req.redis = RedisClient;
  next();
});

routes(app);

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: AllowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.use(handleSocket);

server.listen(process.env.SERVER_PORT, async () => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);

  // Run to create users
  // console.log("Creating user(s)")
  // await createUsers()
  // console.log("Finished creating users")

  // Run to ingest airports data (Just USA for now)
  // await ImportAirports()

  // Run to update lat long format to utilize geospatial from MongoDB
  // await AddGeoLocationFromDbBackup()

  // Run to delete duplicate entries of airports
  // await removeDuplicateAirports()

  // Run to ingest airlines data (Just USA for now)
  // console.log("Initiating Airlines Data load")
  // await ImportAirlines()
  // console.log("Finished Airlines Data Load")

  // Run to ingest aircraft types data
  // await ImportAircraftsTypes()

  // await ImportUserFlights()
});
