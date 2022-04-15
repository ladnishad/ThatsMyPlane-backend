import { SignUpUser } from "../controllers/users/UsersController"
import { GetFlights, AddNewFlight } from "../controllers/flights/FlightsControllers"
import { AddAirline } from "../controllers/airlines/AirlinesControllers"

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
