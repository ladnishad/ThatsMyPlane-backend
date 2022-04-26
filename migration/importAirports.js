import mongoose from "mongoose"
import dotenv from "dotenv";
import axios from "axios"
import { Airport } from "../models/AirportsModel"
import { AirportsUsaData } from "../dataSources/AirportsUsaData"
import { AirportsUsaFromDB } from "../dataSources/AirportsUsaDatabaseExport"
import { asyncForEach } from "../helpers"

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const ImportAirports = async() => {
  console.log("Initiating Airports Data load")
  const inputData = AirportsUsaData

  await asyncForEach(inputData, async(airport) => {
    let latDecimalDegrees = airport["LAT DECIMAL DEGREES"]
    let longDecimalDegrees = airport["LONG DECIMAL DEGREES"]
    const IATA = airport.IATA === "N/A" ? airport.ICAO.slice(1).toUpperCase() : airport.IATA.toUpperCase()
    if( latDecimalDegrees === 0 && longDecimalDegrees === 0){
      console.log(`${airport.NAME} has no data, looking through api`)
      try{
        const airportData = await axios.get(`${process.env.FLIGHTAWARE_API_DOMAIN}/airports/${airport.ICAO.toUpperCase()}`, { headers: {"x-apikey": process.env.FLIGHTAWARE_API_KEY } })
        if(!airportData.data){
          console.log(`${airport.NAME} entry not found`)
        }
        if(airportData.data.latitude && airportData.data.longitude){
          latDecimalDegrees = airportData.data.latitude
          longDecimalDegrees = airportData.data.longitude
        }
        else{
          console.log(`Couldn't find lat long for ${airport.NAME}`)
        }
      } catch(e){
        console.log(`Couldn't find lat long for ${airport.NAME}`)
      }
    }
    const AirportToSave = new Airport({
      ICAO: airport.ICAO.toUpperCase(),
      IATA: airport.IATA,
      name: airport.NAME.toUpperCase(),
      city: airport.CITY.toUpperCase(),
      state: airport.State.toUpperCase(),
      country: airport.Country.toUpperCase(),
      latDecimalDegrees,
      longDecimalDegrees

    })

    AirportToSave.save((err, AirportSaved) => {
      if(err){
        console.error(err)
      }
      return AirportSaved
    })
  })

  console.log("Finished Airports Data Load")
  return 1
}

export const AddGeoLocationFromDbBackup = async() => {
  console.log(`Initiating lat long fix`)
  await asyncForEach(AirportsUsaFromDB, async({ ICAO, IATA, name, city, state, country, latDecimalDegrees, longDecimalDegrees }) => {
    const AirportToSave = new Airport({
      ICAO,
      IATA,
      name,
      city,
      state,
      country,
      location: {
        type: 'Point',
        coordinates: [longDecimalDegrees, latDecimalDegrees]
      }
    })

    AirportToSave.save((err, AirportSaved) => {
      if(err){
        console.error(err)
      }
      return AirportSaved
    })
  })

  console.log(`Finished lat long fix`)
  return 1
}
