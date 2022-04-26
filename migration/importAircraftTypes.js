import mongoose from "mongoose"
import axios from "axios"
import dotenv from "dotenv";
import { AircraftType } from "../models/AircraftsModel"
import { AircraftTypesData } from "../dataSources/AircraftsTypesData"
import { asyncForEach } from "../helpers"

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const ImportAircraftsTypes = async() => {
  console.log("Initiating aircraft types data load")
  const inputData = AircraftTypesData

  await asyncForEach(inputData, async({ IATA, ICAO, Model }) => {
    const AircraftTypeToSave = new AircraftType({
      ICAO: ICAO.toUpperCase(),
      IATA: IATA === "N/A" ? "": IATA.toUpperCase(),
      model: Model.toUpperCase()
    })

    AircraftTypeToSave.save((err, AircraftTypeSaved) => {
      if(err){
        console.error(err)
      }
      return AircraftTypeSaved
    })
  })

  console.log("Finished aircraft types data load")
  return 1
}
