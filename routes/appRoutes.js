import { SignUpUser } from "../controllers/UsersController"
import { GetFlights, AddNewFlight } from "../controllers/FlightsControllers"
import { AddAirline } from "../controllers/AirlinesControllers"

export const routes = (app) => {
  // Public
  app.route("/signup")
  .post(SignUpUser)

  app.route("/airlines")
  .post(AddAirline)

  app.route("/flights")
  .get(GetFlights)
  .post(AddNewFlight)
}
