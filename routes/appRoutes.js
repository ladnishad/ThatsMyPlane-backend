import passport from "passport"
import jwt from "jsonwebtoken"
import JWTR from 'jwt-redis';
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express"

import { SwaggerSpec } from "../swaggerConfig"
import { RedisClientConnect } from "../redisConfig"
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

  app.post("/login", async(req, res, next) => {
    passport.authenticate("login", async(err, user, info) => {
      try{
        if(err || !user){
          const error = new Error(AppStrings["some-error"])
          return next(error)
        }

        req.login({user}, { session: false }, async(error) => {
          if(error) {
            return next(error)
          }

          const body = { _id: user.id, email: user.email }

          const token = await jwt.sign({ user: body }, process.env.PASSPORT_LOCAL_LOGIN_SECRET,{ expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRY}` })
          const refreshToken = await jwt.sign({ user: body }, process.env.PASSPORT_LOCAL_REFRESH_SECRET,{ expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRY}` })

          const userOnDb = await UserGetters.userById({ userId: user._id })
          const decodedRefreshToken = await jwt.verify(refreshToken, process.env.PASSPORT_LOCAL_REFRESH_SECRET)

          const addedRefreshToken = await RefreshTokenSetters.addRefreshTokenForUser({ userId: user._id, token: refreshToken, expiry: decodedRefreshToken.exp * 1000 })

          return res.json({ token, refreshToken })
        })
      } catch(e){
        return next(e)
      }
    })(req, res, next)
  })

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
