import { get as flightGetters, set as flightSetters } from "./helpers"
import { get as aircraftGetters, set as aircraftSetters } from "../aircrafts/helpers"
import { get as airportGetters } from "./helpers"

export const NearByAirports = async(req, res) => {
  const { startLongitude, startLatitude, minDistance=0, maxDistance=40, unit="miles" } = req.body

  try{
    const nearByAirports = await airportGetters.airportsNearBy({
      long: startLongitude,
      lat: startLatitude,
      minDistance,
      maxDistance,
      unit
    })

    res.send(nearByAirports)
  } catch(e){
    res.send(e)
  }
}

export const GetAirports = async(req, res) => {
  const { filters } = req.body

  try {
    const AirportsOnDb = await airportGetters.airports({ filters })

    res.send(AirportsOnDb)
  } catch(e){
    res.send(e)
  }
}
