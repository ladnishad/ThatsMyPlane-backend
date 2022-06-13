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

import { asyncMap } from "../../helpers"

dotenv.config();

export const get = {
  flightDateDayJsObject: ({ flightDate }) => dayjs(flightDate).toISOString(),

  flightsOnFlightDateWithIdent: async({ flightIdent, flightDate }) => {
    const flightsWithThisIdentAPIData = await axios.get(`${process.env.FLIGHTAWARE_API_DOMAIN}/flights/${flightIdent.toUpperCase()}`, { headers: {"x-apikey": process.env.FLIGHTAWARE_API_KEY } })
    const flightsWithThisFlightIdentOnFlightDate = flightsWithThisIdentAPIData.data.flights.filter((flight) => dayjs(flight.scheduled_out).isSame(flightDate, "day"))

    const flightsInformation = await asyncMap(flightsWithThisFlightIdentOnFlightDate, async({ flight_number, registration, scheduled_out, scheduled_in, status, origin, destination, aircraft_type, operator_icao, operator_iata, progress_percent }) => {
      return {
        flightNumber: flight_number,
        flightDate: dayjs(scheduled_out).valueOf(),
        airlineICAO: operator_icao,
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

    const { airlineIATA, airlineICAO, aircraftRegistration, aircraftType, originICAO, destinationICAO, scheduledOut, flightNumber } = userFlight

    const airline = await airlineGetters.airline({ airlineICAO })

    if(!airline){
      throw new Error(AppStrings["airline-not-supported-err-msg"])
    }

    let aircraftOnDb = await aircraftGetters.aircraft({ aircraftRegistration })
    if(!aircraftOnDb){
        aircraftOnDb = await aircraftSetters.createAircraft({ aircraftRegistration, aircraftType, airlineICAO })
    }

    const FlightToAddForUser = new Flight({
      userId,
      airlineId: airline._id,
      aircraftId: aircraftOnDb._id
    })

    if(flightNumber){
      FlightToAddForUser.flightNumber = flightNumber
    }

    if(scheduledOut){
      FlightToAddForUser.flightDate = dayjs(scheduledOut).valueOf()
    }

    if(originICAO){
      const originAirport = await airportGetters.airport({ airportICAO: originICAO })

      if(originAirport){
        FlightToAddForUser.flightOriginAirportId = originAirport.id
      }
    }

    if(destinationICAO){
      const destinationAirport = await airportGetters.airport({ airportICAO: destinationICAO })

      if(destinationAirport){
        FlightToAddForUser.flightDestinationAirportId = destinationAirport.id
      }
    }

    try{
      const FlightAddedForUser = await FlightToAddForUser.save()

      return FlightAddedForUser
    } catch(e){
      throw new Error(e)
    }
  }
}
