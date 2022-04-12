import { SignUpUser } from "../controllers/UsersController"
import { GetFlights, AddNewFlight } from "../controllers/FlightsControllers"

export const routes = (app) => {
  // Public
  app.route("/signup")
  .post(SignUpUser)

  app.route("/flights")
  .get(GetFlights)
  .post(AddNewFlight)
}
