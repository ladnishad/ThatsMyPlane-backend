import mongoose from "mongoose"
import axios from "axios"
import dotenv from "dotenv";
import { Airline } from "../models/AirlinesModel"
import { AirlinesUsaData } from "../dataSources/AirlinesUsaData"
import { asyncForEach } from "../helpers"

dotenv.config();

export const ImportAirlines = async() => {
  const inputData = AirlinesUsaData

  await asyncForEach(inputData, async({ Name, IATA, ICAO, Country, Active }) => {
    const active = Active === "Y" ? true : false

    const AirlineToSave = new Airline({
      ICAO: ICAO.toUpperCase(),
      IATA: IATA.toUpperCase(),
      name: Name.toUpperCase(),
      country: Country.toLowerCase(),
      active
    })

    AirlineToSave.save((err, AirlineSaved) => {
      if(err){
        console.error(err)
      }
      return AirlineSaved
    })
  })

  return 1
}
