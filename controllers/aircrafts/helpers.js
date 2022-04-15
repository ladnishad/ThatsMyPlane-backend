import dayjs from "dayjs"
import dotenv from "dotenv";
import axios from "axios"

import { User } from "../../models/UsersModel"
import { Flight } from "../../models/FlightsModel"
import { Airline } from "../../models/AirlinesModel"
import { Aircraft } from "../../models/AircraftsModel"
import { Airport } from "../../models/AirportsModel"

import { AppStrings } from "../../assets/AppStrings"

dotenv.config();

export const get = {
  aircraft: async({ aircraftRegistration }) => {
    const aircraftSearchResult = await Aircraft.find({ registrationNum: aircraftRegistration }).exec()
    return aircraftSearchResult
  }
}

export const set = {
  "aircraft.create": async({ aircraftRegistration, aircraftType }) => {
    const aircraftOnDb = await Aircraft.find({ registrationNum: aircraftRegistration }).exec()

    if(aircraftOnDb.length){
      throw new Error(AppStrings["aircraft-already-exists-err-msg"])
    }

    else{
      const NewAircraft = new Aircraft({
        registrationNum: aircraftRegistration,
        model: aircraftType
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
