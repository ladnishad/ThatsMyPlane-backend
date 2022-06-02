import passport from "passport"
import jwt from "jsonwebtoken"
import JWTR from 'jwt-redis';
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express"

import { SwaggerSpec } from "../swaggerConfig"
import { RedisClientConnect } from "../redisConfig"
import verifyJWT from "../middlewares/verifyJWT"
import { SignUpUser, LoginUser, RefreshUserToken, LogoutUser } from "../controllers/auth/AuthControllers"
import { get as UserGetters} from "../controllers/users/helpers"
import { get as RefreshTokenGetters, set as RefreshTokenSetters } from "../controllers/refreshTokens/helpers"
import { GetUserProfilePrivate } from "../controllers/users/UsersController"
import { SearchFlights, AddFlightToUserAccount } from "../controllers/flights/FlightsControllers"
import { AddAirline } from "../controllers/airlines/AirlinesControllers"
import { GetAircraftImage } from "../controllers/aircrafts/AircraftControllers"
import { NearByAirports } from "../controllers/airports/AirportsControllers"
import { AppStrings } from "../assets/AppStrings"

dotenv.config();

// TODO: Configure jwt with redis, currently does not return anything from /login

// Start Redis server on linux or WSL by running redis-server
// const RedisClient = RedisClientConnect()
// const JwtWithRedis = new JWTR(RedisClient);

export const routes = (app) => {
  // Public
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(SwaggerSpec))

  app.route("/signup").post(SignUpUser)

  app.route("/login").post(LoginUser)

  app.route("/refresh-token").get(RefreshUserToken)

  app.route("/logout").get(LogoutUser)

  app.get("*", async(req, res) => {
    res.redirect('/docs')
  })
  
  app.use(verifyJWT)

  app.route("/account")
  .get(GetUserProfilePrivate)

  app.route("/airlines")
  .post(AddAirline)

  app.route("/search/flights")
  .post(SearchFlights)

  app.route("/flight/add")
  .post(AddFlightToUserAccount)

  app.route("/aircraft/images")
  .get(GetAircraftImage)

  app.route("/airports/nearby")
  .get(NearByAirports)
}
