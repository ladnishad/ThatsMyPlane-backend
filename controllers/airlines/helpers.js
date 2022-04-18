import dayjs from "dayjs"
import dotenv from "dotenv";
import axios from "axios"

import { User } from "../../models/UsersModel"
import { Flight } from "../../models/FlightsModel"
import { Airline } from "../../models/AirlinesModel"
import { Aircraft } from "../../models/AircraftsModel"
import { Airport } from "../../models/AirportsModel"

dotenv.config();

export const get = {
  airline: async({ airlineICAO }) => {
    const airlineSearchResult = await Airline.find({ ICAO: airlineICAO }).exec()
    return airlineSearchResult.pop()
  }
}
