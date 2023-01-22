import passport from "passport";
import jwt from "jsonwebtoken";
import JWTR from "jwt-redis";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

import { SwaggerSpec } from "../swaggerConfig";
import { RedisClientConnect } from "../redisConfig";
import verifyJWT from "../middlewares/verifyJWT";
import {
  SignUpUser,
  LoginUser,
  RefreshUserToken,
  LogoutUser,
} from "../controllers/auth/AuthControllers";
import { get as UserGetters } from "../controllers/users/helpers";
import {
  get as RefreshTokenGetters,
  set as RefreshTokenSetters,
} from "../controllers/refreshTokens/helpers";
import { GetUserProfilePrivate } from "../controllers/users/UsersController";
import {
  SearchFlights,
  AddFlightToUserAccount,
  UserAircrafts,
} from "../controllers/flights/FlightsControllers";
import {
  GetAirlines,
  AddAirline,
} from "../controllers/airlines/AirlinesControllers";
import {
  GetAircraftTypes,
  GetAircraftImage,
} from "../controllers/aircrafts/AircraftControllers";
import {
  GetAirports,
  NearByAirports,
  SearchAirport,
} from "../controllers/airports/AirportsControllers";

import { GetUserNotifications } from "../controllers/notifications/NotificationsControllers";

import { AppStrings } from "../assets/AppStrings";

dotenv.config();

// TODO: Configure jwt with redis, currently does not return anything from /login

// Start Redis server on linux or WSL by running redis-server
// const RedisClient = RedisClientConnect()
// const JwtWithRedis = new JWTR(RedisClient);

export const routes = (app) => {
  // Public
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(SwaggerSpec));

  app.route("/signup").post(SignUpUser);

  app.route("/login").post(LoginUser);

  app.route("/refresh-token").get(RefreshUserToken);

  app.route("/logout").get(LogoutUser);

  app.route("/notifications").post(verifyJWT, GetUserNotifications)
  app.route("/account").get(verifyJWT, GetUserProfilePrivate);

  app
    .route("/airlines")
    .get(verifyJWT, GetAirlines)
    .post(verifyJWT, AddAirline);

  app.route("/search/flights").post(verifyJWT, SearchFlights);

  // app.route("/search/aircraft").post(verifyJWT, SearchFlightsByRegistration);

  app.route("/flight/add").post(verifyJWT, AddFlightToUserAccount);

  app
    .route("/aircraft/images") // TODO: Cache
    .post(verifyJWT, GetAircraftImage);

  app.route("/aircraft/types").get(verifyJWT, GetAircraftTypes);

  app.route("/airports").get(verifyJWT, GetAirports);

  app.route("/airports/nearby").get(verifyJWT, NearByAirports);

  app.route("/search/airports").post(verifyJWT, SearchAirport);

  app.route("/user/aircrafts").post(verifyJWT, UserAircrafts);

  app.get("*", async (req, res) => {
    res.redirect("/docs");
  });
};
