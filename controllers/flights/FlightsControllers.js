import axios from "axios"
import dayjs from "dayjs"
import dotenv from "dotenv";

import { asyncMap } from "../../helpers"
import { get as flightGetters, set as flightSetters } from "./helpers"
import { get as aircraftGetters, set as aircraftSetters } from "../aircrafts/helpers"
import { get as userGetters } from "../users/helpers"

import { FlightAggregations } from "../../aggregations/FlightAggregations"
import { UserAggregations } from "../../aggregations/UserAggregations"
import { AircraftAggregations } from "../../aggregations/AircraftAggregations"

dotenv.config();

export const SearchFlightsbyFlightNumber = async(req, res) => {
  const { flightNumber, flightDate } = req.body

  try{
    const flightDateDayJsObject = await flightGetters.flightDateDayJsObject({ flightDate })

    const flightsForFlightNumberOnFlightDate = await flightGetters.flightsOnFlightDateWithIdent({ flightIdent: flightNumber, flightDate: flightDateDayJsObject })

    res.send(flightsForFlightNumberOnFlightDate)

  } catch(e){
    res.send(e)
  }
}

export const SearchFlightsByRegistration = async(req, res) => {
  const { registrationNumber, flightDate } = req.body

  try{
    const aircraftOnDb = await aircraftGetters.aircraft({ aircraftRegistration: registrationNumber })

    const flightDateDayJsObject = await flightGetters.flightDateDayJsObject({ flightDate })
    const flightsForRegistrationOnFlightDate = await flightGetters.flightsOnFlightDateWithIdent({ flightIdent: registrationNumber, flightDate: flightDateDayJsObject })

    // Add the aircraft to the database if there is a result
    if(flightsForRegistrationOnFlightDate.length && aircraftOnDb === null){
      const aircraftDetails = flightsForRegistrationOnFlightDate.pop()
      const SavedAircraft = await aircraftSetters.createAircraft({ aircraftRegistration: aircraftDetails.aircraftRegistration, aircraftType: aircraftDetails.aircraftType, airlineICAO: aircraftDetails.airlineICAO })
    }
    res.send(flightsForRegistrationOnFlightDate)
  } catch(e){
    res.send(e)
  }
}

export const SearchHistoricFlight = async(req, res) => {
  const { flightSearchParam, flightDate } = req.body

  try {
    const flightDateDayJsObject = await flightGetters.flightDateDayJsObject({ flightDate })
    const flightsMatchingParamOnFlightDate = await flightGetters.historicFlightsOnFlightDateWithIdent({ flightIdent: flightSearchParam, flightDate: flightDateDayJsObject })

    res.send(flightsMatchingParamOnFlightDate)
  } catch(e) {
    res.send(e)
  }
}

export const AddFlightToUserAccount = async(req, res) => {
  const { userId, flightInformation, caption, visibility, fromApi } = req.body

  try{
    const UserFlight = await flightSetters.newAddUserFlight({ userId, userFlight: flightInformation, caption, visibility, fromApi })
    res.send(UserFlight)
  } catch(e){
    res.send(e)
  }
}

export const FlightsDetailsForUser = async (req, res) => {
  const { userId } = req.body

  try {
    const FlightsForUser = await FlightAggregations.getAllUserFlightsAllDetailsAggregation({ userId })
    res.send(FlightsForUser)
  } catch(e){
    res.send(e)
  }
}

export const UserAircrafts = async(req, res) => {
  const { redis } = req

  const { userId } = req.body

  try{
    const cachedResults = await redis.get(`${userId}-aircrafts`)

    if(cachedResults){
      const CachedFlightsForUser = JSON.parse(cachedResults)

      res.send(CachedFlightsForUser)
    }
    else{
      const FlightsForUserByAircraft = await AircraftAggregations.getAllUserFlightsByAircrafts({ userId })

      await redis.set(`${userId}-aircrafts`, JSON.stringify(FlightsForUserByAircraft), {
        EX: 180,
        NX: true
      })

      res.send(FlightsForUserByAircraft)
    }
  } catch(e){
    console.log(e);
  }
}
