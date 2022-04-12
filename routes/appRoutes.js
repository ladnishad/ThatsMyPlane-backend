import { GetFlights, AddNewFlight } from "../controllers/FlightsControllers"

export const routes = ({ route }) => {
  route("/flights")
  .get(GetFlights)
  .post(AddNewFlight)
}
