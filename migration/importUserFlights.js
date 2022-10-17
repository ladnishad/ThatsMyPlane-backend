import mongoose from "mongoose"
import axios from "axios"
import { User } from "../models/UsersModel"
import { asyncForEach } from "../helpers"
import { MyFlightsInUSA } from "../dataSources/PersonalHistoricFlights"

export const ImportUserFlights = async () => {
  await asyncForEach(MyFlightsInUSA, async({ airline, aircraftType, aircraftRegistration, flightNumber, flightDate, flightOriginAirport, flightDestinationAirport }) => {
    const airlineOnDb = await Airlines.findOne({ name: airline})

    if(!airlineOnDb){
      throw new Error("Airline not found")
    }

    


  })
}
