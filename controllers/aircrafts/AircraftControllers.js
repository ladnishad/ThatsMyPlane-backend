import axios from "axios";
import dayjs from "dayjs";
import dotenv from "dotenv";

import { asyncMap } from "../../helpers";
import { get as flightGetters, set as flightSetters } from "./helpers";
import {
  get as aircraftGetters,
  set as aircraftSetters,
} from "../aircrafts/helpers";
import { get as userGetters } from "../users/helpers";
import RedisClient from "@redis/client/dist/lib/client";

dotenv.config();

export const GetAircraftImage = async (req, res) => {
  const { redis } = req;
  const { aircraftRegistration } = req.body;
  try {
    const cachedResults = await redis.get(`${aircraftRegistration}-images`);

    if (cachedResults) {
      const CachedImagesForAircraft = JSON.parse(cachedResults);
      res.send(CachedImagesForAircraft);
    } else {
      const aircraftImages = await aircraftGetters["aircraft.images"]({
        aircraftRegistration,
      });

      await redis.set(
        `${aircraftRegistration}-images`,
        JSON.stringify(aircraftImages),
        {
          EX: 180,
          NX: true,
        }
      );
      res.send(aircraftImages);
    }
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

export const GetAircraftTypes = async (req, res) => {
  const { filters } = req.body;

  try {
    const AircraftTypesOnDb = await aircraftGetters.aircraftTypes({ filters });

    res.send(AircraftTypesOnDb);
  } catch (e) {
    res.send(e);
  }
};
