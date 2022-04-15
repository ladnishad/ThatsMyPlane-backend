import dayjs from "dayjs"
import dotenv from "dotenv";
import axios from "axios"

import { User } from "../../models/UsersModel"
import { Flight } from "../../models/FlightsModel"
import { Airline } from "../../models/AirlinesModel"
import { Aircraft } from "../../models/AircraftsModel"
import { Airport } from "../../models/AirportsModel"

import { AppStrings } from "../../assets/AppStrings"

import { get as airlineGetters } from "../airlines/helpers"
import { get as airportGetters } from "../airports/helpers"
import { get as aircraftGetters, set as aircraftSetters } from "../aircrafts/helpers"

dotenv.config();

export const get = {
  flightDateDayJsObject: ({ flightDate }) => dayjs(flightDate).toISOString(),

  flightsOnFlightDate: async({ flightNumber, flightDate }) => {
    const flightsWithThisFlightNumberAPIData = await axios.get(`${process.env.FLIGHTAWARE_API_DOMAIN}/flights/${flightNumber.toUpperCase()}`, { headers: {"x-apikey": process.env.FLIGHTAWARE_API_KEY } })

    const flightsWithThisFlightNumberOnFlightDate = flightsWithThisFlightNumberAPIData.data.flights.filter((flight) => dayjs(flight.scheduled_out).isSame(flightDate, "day"))

    const flightsInformation = await asyncMap(flightsWithThisFlightNumberOnFlightDate, async({ registration, scheduled_out, scheduled_in, status, origin, destination, aircraft_type, operator, operator_iata, progress_percent }) => {
      return {
        airlineICAO: operator,
        airlineIATA: operator_iata,
        aircraftRegistration: registration,
        aircraftType: aircraft_type,
        scheduledOut: scheduled_out,
        scheduledIn: scheduled_in,
        originICAO: origin.code,
        destinationICAO: destination.code,
        status,
        progressPercent: progress_percent
      }
    })

    return flightsInformation
  },
}

export const set = {
  addUserFlight: async({ userId, userFlight }) => {
    const user = await User.findById(userId).exec()
    if(!user){
      throw new Error(AppStrings["user-not-found-err-msg"])
    }

    const { airlineIATA, airlineICAO, aircraftRegistration, aircraftType, originICAO, destinationICAO, flightDate, flightNumber } = userFlight

    const airline = await airlineGetters.airline({ airlineICAO })

    if(!airline){
      throw new Error(AppStrings["airline-not-supported-err-msg"])
    }

    const originAirport = await airportGetters.airport({ airportICAO: originICAO })
    const destinationAirport = await airportGetters.airport({ airportICAO: destinationICAO })

    if(!originAirport || !destinationAirport){
      throw new Error(AppStrings["airport-not-supported-err-msg"])
    }

    let aircraft = await aircraftGetters.aircraft({ aircraftRegistration })

    if(!aircraft){
        aircraft = await aircraftSetters.aircraft.create({ aircraftRegistration, aircraftType})
    }

    const FlightToAddForUser = new Flight({
      userId,
      airlineId: airline._id,
      aircraftId: aircraft._id,
      flightNumber,
      flightDate,
      flightOriginAirportId: originAirport._id,
      flightDestinationAirportId: destinationAirport._id
    })

    try{
      const FlightAddedForUser = await FlightToAddForUser.save()

      return FlightAddedForUser
    } catch(e){
      throw new Error(e)
    }
  }
}
