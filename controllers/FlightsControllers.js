import { parseString } from "xml2js"
import axios from "axios"
import dotenv from "dotenv";

dotenv.config();
export const GetFlights = async (req, res) => {

  try {

  } catch (e) {
    res.send(e);
  }
};

export const AddNewFlight = async (req, res) => {
  // TODO: Inputs will eventually be flight number, date of flight
  const { aircraftRegistration } = req.body
  try {
    // TODO: Add flightaware API calls to fetch aircraft registration based on the flight number


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

    const aircraftImageResponse = photosToConsider.map(({ server, id, secret, title }) => {
      const aircraftPhotoURL = `${process.env.FLICKR_PHOTO_URL}/${server}/${id}_${secret}.jpg`

      return {
        aircraftPhotoURL,
        aircraftPhotoTitle: title
      }
    })

    res.send({
      aircraftRegistration,
      images: aircraftImageResponse
    })
  } catch (e) {
    console.log(e)
    res.send(e)
  }
};
