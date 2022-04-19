import { SignUpUser } from "../controllers/users/UsersController"
import { SearchFlights, AddFlightToUserAccount, AddNewFlight } from "../controllers/flights/FlightsControllers"
import { AddAirline } from "../controllers/airlines/AirlinesControllers"
import { GetAircraftImage } from "../controllers/aircrafts/AircraftControllers"

export const routes = (app) => {
  // Public
  app.route("/signup")
  .post(SignUpUser)

  app.route("/airlines")
  .post(AddAirline)

  app.route("/search/flights")
  .post(SearchFlights)

  app.route("/flight/add")
  .post(AddFlightToUserAccount)

  app.route("/aircraft/images")
  .get(GetAircraftImage)

  app.route("/flights")
  .post(AddNewFlight)
}
