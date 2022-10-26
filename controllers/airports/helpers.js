import dayjs from "dayjs"
import dotenv from "dotenv";
import axios from "axios"

import { User } from "../../models/UsersModel"
import { Flight } from "../../models/FlightsModel"
import { Airline } from "../../models/AirlinesModel"
import { Aircraft } from "../../models/AircraftsModel"
import { Airport } from "../../models/AirportsModel"
import { milesToMeters } from "../../helpers"

dotenv.config();

export const get = {
  airport: async({ airportICAO }) => {
    const airportSearchResult = await Airport.find({ ICAO: airportICAO }).exec()
    return airportSearchResult.pop()
  },
  airportById: async ({ airportId }) => {
    const airportByIdResult = await Airport.findOne({ _id: airportId })
    return airportByIdResult
  },
  airports: async({ filters }) => {
    if(!filters){
      const AirportsOnDb = await Airport.find({}).exec()
      return AirportsOnDb
    }

    const AirportsOnDb = await Airport.find({ ...filters }).exec()
    return AirportsOnDb
  },
  airportsNearBy: async({ long=0, lat=0, minDistance=0, maxDistance=40, unit="miles"}) => {
    try{
      let verifiedMinDistance = unit === "miles" ? milesToMeters(minDistance) : minDistance
      let verifiedMaxDistance = unit === "miles" ? milesToMeters(maxDistance) : maxDistance

      const airportsSearchResult = await Airport.find({
           location:
             { $near:
                {
                  $geometry: { type: "Point",  coordinates: [ long, lat ] },
                  $minDistance: verifiedMinDistance,
                  $maxDistance: verifiedMaxDistance
                }
             }
         }).exec()

      return airportsSearchResult
    } catch(e){
      throw new Error(e)
    }
  }
}
