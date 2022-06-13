import axios from "axios"
import dayjs from "dayjs"
import dotenv from "dotenv"

import { asyncMap } from "../../helpers"
import { get as flightGetters, set as flightSetters } from "./helpers"
import { get as aircraftGetters, set as aircraftSetters } from "../aircrafts/helpers"
import { get as userGetters } from "../users/helpers"

dotenv.config();

export const GetAircraftImage = async(req, res) => {
  console.log("Received req");
  const { aircraftRegistration } = req.body
  console.log(`reg is ${aircraftRegistration}`);
  try{
    const aircraftImages = await aircraftGetters["aircraft.images"]({ aircraftRegistration })
    console.log(aircraftImages);
    res.send(aircraftImages)
  } catch(e){
    console.log(e);
    res.send(e)
  }
}

export const GetAircraftTypes = async(req, res) => {
  const { filters } = req.body

  try {
    const AircraftTypesOnDb = await aircraftGetters.aircraftTypes({ filters })

    res.send(AircraftTypesOnDb)
  } catch(e){
    res.send(e)
  }
}
