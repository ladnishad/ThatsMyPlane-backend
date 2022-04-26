import dayjs from "dayjs"
import dotenv from "dotenv";
import axios from "axios"

import { User } from "../../models/UsersModel"
import { Flight } from "../../models/FlightsModel"
import { Airline } from "../../models/AirlinesModel"
import { AircraftType, Aircraft } from "../../models/AircraftsModel"
import { Airport } from "../../models/AirportsModel"

import { AppStrings } from "../../assets/AppStrings"
import { asyncMap } from "../../helpers"

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const get = {
  aircraft: async({ aircraftRegistration }) => {
    const aircraftSearchResult = await Aircraft.find({ registrationNum: aircraftRegistration }).exec()
    return aircraftSearchResult.pop()
  },
  "aircraft.images": async({ aircraftRegistration }) => {
    let aircraftImageResponse = []
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

    aircraftImageResponse = await asyncMap(photosToConsider, async({ server, id, secret, title }) => {
      const aircraftPhotoURL = `${process.env.FLICKR_PHOTO_URL}/${server}/${id}_${secret}.jpg`

      return {
        aircraftPhotoURL,
        aircraftPhotoTitle: title
      }
    })

    return aircraftImageResponse
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
