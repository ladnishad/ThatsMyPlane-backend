import mongoose from "mongoose"

import { Airport } from "../models/AirportsModel"
import { AirportsUsaData } from "../dataSources/AirportsUsaData"
import { asyncForEach } from "../helpers"

export const ImportAirports = async() => {
  const inputData = AirportsUsaData

  await asyncForEach(inputData, async({ ICAO, IATA, Name, City, Country, State }) => {
    IATA = IATA === "N/A" ? ICAO.slice(1).toUpperCase() : IATA.toUpperCase()
    const AirportToSave = new Airport({
      ICAO: ICAO.toUpperCase(),
      IATA,
      name: Name.toUpperCase(),
      city: City.toUpperCase(),
      state: State.toUpperCase(),
      country: Country.toUpperCase()
    })

    AirportToSave.save((err, AirportSaved) => {
      if(err){
        console.error(err)
      }
      return AirportSaved
    })
  })

  return 1
}
