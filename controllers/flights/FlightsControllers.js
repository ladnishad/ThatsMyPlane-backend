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

import { FlightAggregations } from "../../aggregations/FlightAggregations";
import { UserAggregations } from "../../aggregations/UserAggregations";
import { AircraftAggregations } from "../../aggregations/AircraftAggregations";

dotenv.config();

export const SearchFlights = async (req, res) => {
  const { flightIdent, flightDate } = req.body;

  try {
    const flightDateDayJsObject = await flightGetters.flightDateDayJsObject({
      flightDate,
    });

    const flights = await flightGetters.flightsWithIdent({
      flightIdent,
      flightDate: flightDateDayJsObject,
    });

    res.send(flights);
  } catch (e) {
    res.send(e);
  }
};

export const AddFlightToUserAccount = async (req, res) => {
  const { userId, flightInformation, caption, visibility, fromApi } = req.body;

  try {
    const UserFlight = await flightSetters.addUserFlight({
      userId,
      userFlight: flightInformation,
      caption,
      visibility,
      fromApi,
    });
    res.send(UserFlight);
  } catch (e) {
    res.send(e);
  }
};

export const FlightsDetailsForUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const FlightsForUser =
      await FlightAggregations.getAllUserFlightsAllDetailsAggregation({
        userId,
      });
    res.send(FlightsForUser);
  } catch (e) {
    res.send(e);
  }
};

export const UserAircrafts = async (req, res) => {
  const { redis } = req;

  const { userId } = req.body;

  try {
    const cachedResults = await redis.get(`${userId}-aircrafts`);

    if (cachedResults) {
      const CachedFlightsForUser = JSON.parse(cachedResults);

      res.send(CachedFlightsForUser);
    } else {
      const FlightsForUserByAircraft =
        await AircraftAggregations.getAllUserFlightsByAircrafts({ userId });

      await redis.set(
        `${userId}-aircrafts`,
        JSON.stringify(FlightsForUserByAircraft),
        {
          EX: 180,
          NX: true,
        }
      );

      res.send(FlightsForUserByAircraft);
    }
  } catch (e) {
    console.log(e);
  }
};
