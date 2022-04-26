import axios from "axios"
import dayjs from "dayjs"
import dotenv from "dotenv"

import { asyncMap } from "../../helpers"
import { get as flightGetters, set as flightSetters } from "./helpers"
import { get as aircraftGetters, set as aircraftSetters } from "../aircrafts/helpers"
import { get as userGetters } from "../users/helpers"

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const GetAircraftImage = async(req, res) => {
  const { aircraftRegistration } = req.body

  try{
    const aircraftImages = await aircraftGetters["aircraft.images"]({ aircraftRegistration })

    res.send(aircraftImages)
  } catch(e){
    res.send(e)
  }
}
