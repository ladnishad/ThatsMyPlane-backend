import axios from "axios"
import dayjs from "dayjs"
import dotenv from "dotenv";

import { asyncMap } from "../helpers"

dotenv.config();
export const GetFlights = async (req, res) => {

  try {

  } catch (e) {
    res.send(e);
  }
};

export const AddNewFlight = async (req, res) => {
  const { flightNumber, flightDate } = req.body
  try {
    const flightDateDayJsObject = dayjs(flightDate).toISOString()

    // Flightaware API calls to fetch aircraft registration based on the flight number
    const flightsWithThisFlightNumberData = await axios.get(`${process.env.FLIGHTAWARE_API_DOMAIN}/flights/${flightNumber.toUpperCase()}`, { headers: {"x-apikey": process.env.FLIGHTAWARE_API_KEY } })

    const flightsWithThisFlightNumber = flightsWithThisFlightNumberData.data.flights.filter((flight) => dayjs(flight.scheduled_out).isSame(flightDateDayJsObject, "day"))

    const flightInformation = await asyncMap(flightsWithThisFlightNumber, async({ registration, scheduled_out, scheduled_in, status, progress_percent }) => {
      const aircraftRegistration = registration

      let aircraftImageResponse = []
      if(aircraftRegistration !== null){
        // Get aircraft picture
        const flickrUrl = `${process.env.FLICKR_PHOTO_SEARCH_URL}&text=${aircraftRegistration}`

        const aircraftPhotosReq = await axios.get(flickrUrl)

        const aircraftPhotos = aircraftPhotosReq.data.photos.photo
        const numOfPhotos = aircraftPhotos.length

        let photosToConsider = []

        // If there are more than 5 pictures, only show 5
        // If less than 5, make sure there are atleast 2 and show them
        // Else show the last image

        if(numOfPhotos > 5){
          photosToConsider = aircraftPhotos.slice(0,5)
        }
        if(numOfPhotos >= 2 && numOfPhotos < 5){
          photosToConsider = aircraftPhotos.slice(0,2)
        }

        if(numOfPhotos < 2){
          photosToConsider = [aircraftPhotos[numOfPhotos-1]]
        }

        aircraftImageResponse = photosToConsider.map(({ server, id, secret, title }) => {
          const aircraftPhotoURL = `${process.env.FLICKR_PHOTO_URL}/${server}/${id}_${secret}.jpg`

          return {
            aircraftPhotoURL,
            aircraftPhotoTitle: title
          }
        })
      }

      return {
        aircraftRegistration,
        status,
        scheduledOut: scheduled_out,
        scheduledIn: scheduled_in,
        progressPercent: progress_percent,
        aircraftImageResponse
      }
    })

    res.send(flightInformation)
  } catch (e) {
    console.log(e)
    res.send(e)
  }
};
