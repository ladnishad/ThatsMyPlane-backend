import dayjs from "dayjs"
import dotenv from "dotenv";
import axios from "axios"

import { User } from "../../models/UsersModel"
import { Flight } from "../../models/FlightsModel"
import { Airline } from "../../models/AirlinesModel"
import { AircraftType, Aircraft } from "../../models/AircraftsModel"
import { Airport } from "../../models/AirportsModel"

import { AppStrings } from "../../assets/AppStrings"

dotenv.config();

export const get = {
  aircraft: async({ aircraftRegistration }) => {
    const aircraftSearchResult = await Aircraft.find({ registrationNum: aircraftRegistration }).exec()
    return aircraftSearchResult.pop()
  }
}

export const set = {
  createAircraft: async({ aircraftRegistration, aircraftType }) => {
    const aircraftOnDb = await Aircraft.find({ registrationNum: aircraftRegistration }).exec()

    if(aircraftOnDb.length){
      throw new Error(AppStrings["aircraft-already-exists-err-msg"])
    }

    else{
      const aircraftTypeOnDb = await AircraftType.find({ ICAO: aircraftType.toUpperCase() }).exec()

      if(!aircraftTypeOnDb.length){
        throw new Error(AppStrings["aircraft-type-not-supported-err-msg"])
      }

      const NewAircraft = new Aircraft({
        registrationNum: aircraftRegistration,
        aircraftTypeId: aircraftTypeOnDb.pop()._id
      })

      try{
        const SavedAircraft = await NewAircraft.save()
        return SavedAircraft
      } catch(e){
        throw new Error(e)
      }
    }
  }
}
