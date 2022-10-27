import mongoose from "mongoose"
import dotenv from "dotenv";

import dayjs from "dayjs"
import axios from "axios"
import { User } from "../models/UsersModel"
import { Airline } from "../models/AirlinesModel"
import { Airport } from "../models/AirportsModel"
import { AircraftType } from "../models/AircraftsModel"
import { asyncForEach, asyncMap } from "../helpers"
import { set as FlightSetters } from "../controllers/flights/helpers"
import { MyFlightsInUSA } from "../dataSources/PersonalHistoricFlights"

dotenv.config();

export const ImportUserFlights = async () => {
  const user = await User.findOne({ email: process.env.ADMIN_LOGIN })

  if(!user){
    throw new Error("User not found")
  }
  console.log("Processing data to feed to the api setter");
  const processedFlights = await asyncMap(MyFlightsInUSA, async({ airline, aircraftType, aircraftRegistration, flightNumber, flightDate, flightOriginAirport, flightDestinationAirport }) => {
    try {
      const airlineOnDb = await Airline.findOne({ name: airline.toUpperCase()}).exec()

      if(!airlineOnDb){
        throw new Error("Airline not found")
      }

      const originAirport = await Airport.findOne({ IATA: flightOriginAirport }).exec()

      const destinationAirport = await Airport.findOne({ IATA: flightOriginAirport }).exec()

      if(!originAirport || !destinationAirport){
        throw new Error("An airport was not found")
      }

      const aircraftTypeOnDb = await AircraftType.findOne({ ICAO: aircraftType })

      if(!aircraftTypeOnDb){
        throw new Error("Aircraft type not found")
      }

      const scheduledOut = flightDate === "" ? 0 : dayjs(flightDate).valueOf()

      const userFlight = {
        airlineIATA: airlineOnDb?.IATA,
        airlineICAO: airlineOnDb?.ICAO,
        aircraftRegistration,
        aircraftType,
        originICAO: originAirport?.ICAO,
        destinationICAO: destinationAirport?.ICAO,
        scheduledOut,
        flightNumber
      }

      return userFlight
    } catch(e){
      console.log(e);
    }
  })

    console.log(`Data processing complete with data of length ${processedFlights?.length}`);

    try {
      console.log("Adding");

      await asyncForEach(processedFlights, async(eachFlight) => {
        const addedUserFlight = await FlightSetters.newAddUserFlight({ userId: user?._id, userFlight: eachFlight, caption: "", visibility: "Private" })
        console.log(addedUserFlight);
      })

    } catch(e){
      console.log(e);
    }
}
