import dayjs from "dayjs";
import dotenv from "dotenv";
import axios from "axios";

import { User } from "../../models/UsersModel";
import { Flight } from "../../models/FlightsModel";
import { Airline } from "../../models/AirlinesModel";
import { AircraftType, Aircraft } from "../../models/AircraftsModel";
import { Airport } from "../../models/AirportsModel";
import { Image } from "../../models/ImagesModel";

import { get as AirlineGetters } from "../airlines/helpers";
import { AppStrings } from "../../assets/AppStrings";
import { asyncMap } from "../../helpers";

dotenv.config();

export const get = {
  aircraft: async ({ aircraftRegistration }) => {
    const aircraftSearchResult = await Aircraft.find({
      registrationNum: aircraftRegistration,
    }).exec();

    if (aircraftSearchResult.length) {
      return aircraftSearchResult.pop();
    }
    return null;
  },
  "aircraft.images": async ({ aircraftRegistration }) => {
    const aircraftOnDb = await Aircraft.find({
      registrationNum: aircraftRegistration,
    }).exec();

    if (!aircraftOnDb.length) {
      const flickrUrl = `${process.env.FLICKR_PHOTO_SEARCH_URL}&text=${aircraftRegistration}`;

      const aircraftPhotosReq = await axios.get(flickrUrl);

      const aircraftPhotos = aircraftPhotosReq.data.photos.photo;
      const numOfPhotos = aircraftPhotos.length;

      let photosToConsider = [];

      // If there are more than 5 pictures, only save  5
      // If less than 5, make sure there are atleast 2 and save them
      // Else show the last image

      if (numOfPhotos > 5) {
        photosToConsider = aircraftPhotos.slice(0, 5);
      }
      if (numOfPhotos >= 2 && numOfPhotos < 5) {
        photosToConsider = aircraftPhotos.slice(0, 2);
      }

      if (numOfPhotos < 2) {
        photosToConsider = [aircraftPhotos[numOfPhotos - 1]];
      }

      const ImagesForAircraft = await asyncMap(
        photosToConsider,
        async ({ server, id, secret, title }) => {
          const aircraftPhotoURL = `${process.env.FLICKR_PHOTO_URL}/${server}/${id}_${secret}_c.jpg`;

          return {
            aircraftPhotoURL,
            aircraftPhotoTitle: title,
          };
        }
      );
      return ImagesForAircraft
    }

    const aircraft = aircraftOnDb.pop();

    const aircraftImagesOnDb = await Image.find({
      $and: [
        { imageType: "aircraft" },
        { aircraftId: aircraft?._id },
        { isProfilePic: false },
        { useOnApp: true },
      ],
    }).exec();

    if (aircraftImagesOnDb.length) {
      return aircraftImagesOnDb.map((image) => {
        return {
          aircraftPhotoURL: image?.url,
          aircraftPhotoTitle: image?.caption,
        };
      });
    } else {
      const newImagesForAircraft = await set.imagesForAircraft({
        aircraftId: aircraft?._id,
      });

      return newImagesForAircraft.map((image) => {
        return {
          aircraftPhotoURL: image?.url,
          aircraftPhotoTitle: image?.caption,
        };
      });
    }
  },
  aircraftTypes: async ({ filters }) => {
    if (!filters) {
      const AircraftTypesOnDb = await AircraftType.find({}).exec();
      return AircraftTypesOnDb;
    }

    const AircraftTypesOnDb = await AircraftType.find({ ...filters }).exec();
    return AircraftTypesOnDb;
  },
};

export const set = {
  createAircraft: async ({
    aircraftRegistration,
    aircraftType,
    airlineICAO,
  }) => {
    const aircraftOnDb = await Aircraft.find({
      registrationNum: aircraftRegistration,
    }).exec();

    if (aircraftOnDb.length) {
      throw new Error(AppStrings["aircraft-already-exists-err-msg"]);
    } else {
      const aircraftTypeOnDb = await AircraftType.find({
        ICAO: aircraftType.toUpperCase(),
      }).exec();

      if (!aircraftTypeOnDb.length) {
        throw new Error(AppStrings["aircraft-type-not-supported-err-msg"]);
      }

      const NewAircraft = new Aircraft({
        registrationNum: aircraftRegistration,
        aircraftTypeId: aircraftTypeOnDb.pop()._id,
      });

      if (airlineICAO) {
        const airlineOnDb = await AirlineGetters.airline({ airlineICAO });

        if (airlineOnDb) {
          NewAircraft.airlineId = airlineOnDb.id;
        }
      }

      try {
        const SavedAircraft = await NewAircraft.save();
        return SavedAircraft;
      } catch (e) {
        throw new Error(e);
      }
    }
  },
  imagesForAircraft: async ({ aircraftId }) => {
    try {
      const aircraftOnDb = await Aircraft.find({
        _id: aircraftId,
      }).exec();

      if (!aircraftOnDb.length) {
        throw new Error(AppStrings["aircraft-not-found-err-msg"]);
      }

      const aircraft = aircraftOnDb.pop();

      const flickrUrl = `${process.env.FLICKR_PHOTO_SEARCH_URL}&text=${aircraft?.registrationNum}`;

      const aircraftPhotosReq = await axios.get(flickrUrl);

      const aircraftPhotos = aircraftPhotosReq.data.photos.photo;
      const numOfPhotos = aircraftPhotos.length;

      let photosToConsider = [];

      // If there are more than 5 pictures, only save  5
      // If less than 5, make sure there are atleast 2 and save them
      // Else show the last image

      if (numOfPhotos > 5) {
        photosToConsider = aircraftPhotos.slice(0, 5);
      }
      if (numOfPhotos >= 2 && numOfPhotos < 5) {
        photosToConsider = aircraftPhotos.slice(0, 2);
      }

      if (numOfPhotos < 2) {
        photosToConsider = [aircraftPhotos[numOfPhotos - 1]];
      }

      const savedAircraftImages = await asyncMap(
        photosToConsider,
        async ({ server, id, secret, title }) => {
          const aircraftPhotoURL = `${process.env.FLICKR_PHOTO_URL}/${server}/${id}_${secret}_c.jpg`;

          const imageToSave = new Image({
            imageType: "aircraft",
            caption: title,
            url: aircraftPhotoURL,
            aircraftId,
            isProfilePic: false,
            userUploaded: false,
            airlineId: aircraft?.airlineId,
            airportId: "",
            useOnApp: true,
            public: true,
          });

          const savedImage = await imageToSave.save();
          return savedImage;
        }
      );
      return savedAircraftImages;
    } catch (e) {
      throw new Error(e);
    }
  },
};
