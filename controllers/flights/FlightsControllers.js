import axios from "axios"
import dayjs from "dayjs"
import dotenv from "dotenv";

import { asyncMap } from "../../helpers"
import { get as flightGetters, set as flightSetters } from "./helpers"
import { get as aircraftGetters, set as aircraftSetters } from "../aircrafts/helpers"
import { get as userGetters } from "../users/helpers"

dotenv.config();

export const SearchFlights = async(req, res) => {
  const { flightNumber, flightDate } = req.body

  try{
    const flightDateDayJsObject = await flightGetters.flightDateDayJsObject({ flightDate })

    const flightsForFlightNumberOnFlightDate = await flightGetters.flightsOnFlightDate({ flightNumber, flightDate: flightDateDayJsObject })

    res.send(flightsForFlightNumberOnFlightDate)

  } catch(e){
    res.send(e)
  }
}

export const SearchFlightsByRegistration = async(req, res) => {
  const { registrationNumber } = req.body

  try{
    const aircraftOnDb = await aircraftGetters.aircraft({ aircraftRegistration: registrationNumber })

    if(aircraftOnDb !== null){
      return aircraftOnDb
    }

    const aircraftFromApi = await flightGetters.aircraftByRegistrationNumber({ registrationNumber })

    res.send(aircraftFromApi)
  } catch(e){
    res.send(e)
  }
}

export const AddFlightToUserAccount = async(req, res) => {
  const { userId, flightInformation } = req.body

  try{
    const UserFlight = await flightSetters.addUserFlight({ userId, userFlight: flightInformation })
    res.send(UserFlight)
  } catch(e){
    res.send(e)
  }
}
