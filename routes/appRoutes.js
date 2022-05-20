import passport from "passport"
import jwt from "jsonwebtoken"
import JWTR from 'jwt-redis';
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express"

import { SwaggerSpec } from "../swaggerConfig"
import { RedisClientConnect } from "../redisConfig"
import { LoginUser, RefreshUserToken } from "../controllers/auth/AuthControllers"
import { LogoutUser } from "../controllers/users/UsersController"
import { get as UserGetters} from "../controllers/users/helpers"
import { get as RefreshTokenGetters, set as RefreshTokenSetters } from "../controllers/refreshTokens/helpers"
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

  app.post("/signup", passport.authenticate("signup", { session: false }), async(req, res, next) => {
    res.json({
      message: AppStrings["user-signup-successful"]
    })
  })

  app.route("/login").post(LoginUser)

  app.route("refresh-token").get(RefreshUserToken)

  app.route("/logout")
  .post(passport.authenticate('jwt', { session: false }), LogoutUser)

  app.route("/airlines")
  .post(passport.authenticate('jwt', { session: false }), AddAirline)

  app.route("/search/flights")
  .post(passport.authenticate('jwt', { session: false }), SearchFlights)

  app.route("/flight/add")
  .post(passport.authenticate('jwt', { session: false }), AddFlightToUserAccount)

  app.route("/aircraft/images")
  .get(passport.authenticate('jwt', { session: false }), GetAircraftImage)

  app.route("/airports/nearby")
  .get(passport.authenticate('jwt', { session: false }), NearByAirports)

  app.get("*", async(req, res) => {
    res.redirect('/docs')
  })
}
