import passport from "passport"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";

import { SignUpUser } from "../controllers/users/UsersController"
import { SearchFlights, AddFlightToUserAccount } from "../controllers/flights/FlightsControllers"
import { AddAirline } from "../controllers/airlines/AirlinesControllers"
import { GetAircraftImage } from "../controllers/aircrafts/AircraftControllers"
import { NearByAirports } from "../controllers/airports/AirportsControllers"
import { AppStrings } from "../assets/AppStrings"

dotenv.config();

export const routes = (app) => {
  // Public
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
          const token = jwt.sign({ user: body }, process.env.PASSPORT_LOCAL_LOGIN_SECRET)

          return res.json({ token })
        })
      } catch(e){
        return next(e)
      }
    })(req, res, next)
  })

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
}
