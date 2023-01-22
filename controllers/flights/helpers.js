import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import dotenv from "dotenv";
import axios from "axios";

import { User } from "../../models/UsersModel";
import { Flight } from "../../models/FlightsModel";
import { Airline } from "../../models/AirlinesModel";
import { Aircraft } from "../../models/AircraftsModel";
import { Airport } from "../../models/AirportsModel";

import { AppStrings } from "../../assets/AppStrings";

import { get as airlineGetters } from "../airlines/helpers";
import { get as airportGetters } from "../airports/helpers";
import {
  get as aircraftGetters,
  set as aircraftSetters,
} from "../aircrafts/helpers";

import { asyncMap } from "../../helpers";

dotenv.config();

dayjs.extend(isToday);

export const get = {
  flightDateDayJsObject: ({ flightDate }) => dayjs(flightDate).toISOString(),

  // Used for searching flights
  flightsWithIdent: async ({ flightIdent, flightDate }) => {
    try {
      const { type, value } = flightIdent;

      const dateToday = dayjs();
      const flightDateDayJs = dayjs(flightDate);
      const isFlightDateToday = flightDateDayJs.isToday();
      const isFlightDateInFuture = flightDateDayJs.isAfter(dateToday, "day");

      if (!isFlightDateToday && !isFlightDateInFuture) {
        const startDate = dayjs(flightDate)
          .hour(0)
          .minute(0)
          .second(0)
          .toISOString();
        const endDate = dayjs(flightDate)
          .hour(23)
          .minute(59)
          .second(59)
          .toISOString();

        const flightsAPIData = await axios.get(
          `${
            process.env.FLIGHTAWARE_API_DOMAIN
          }/history/flights/${value.toUpperCase()}`,
          {
            headers: { "x-apikey": process.env.FLIGHTAWARE_API_KEY },
            params: { start: startDate, end: endDate },
          }
        );

        const flightsInformation = await asyncMap(
          flightsAPIData.data.flights,
          async ({
            flight_number,
            registration,
            scheduled_out,
            scheduled_in,
            status,
            origin,
            destination,
            aircraft_type,
            operator_icao,
            operator_iata,
            progress_percent,
          }) => {
            return {
              flightNumber: flight_number,
              flightDate: dayjs(scheduled_out).valueOf(),
              airlineICAO: operator_icao,
              airlineIATA: operator_iata,
              aircraftRegistration: registration,
              aircraftType: aircraft_type,
              scheduledOut: scheduled_out,
              scheduledIn: scheduled_in,
              originICAO: origin.code,
              destinationICAO: destination.code,
              status,
              progressPercent: progress_percent,
            };
          }
        );

        return flightsInformation;
      } else {
        const flightsWithIdentAPIData = await axios.get(
          `${
            process.env.FLIGHTAWARE_API_DOMAIN
          }/flights/${value.toUpperCase()}`,
          { headers: { "x-apikey": process.env.FLIGHTAWARE_API_KEY } }
        );

        const flightsWithFlightIdentOnFlightDate =
          flightsWithIdentAPIData.data.flights.filter((flight) =>
            dayjs(flight.scheduled_out).isSame(flightDate, "day")
          );

        const flightsInformation = await asyncMap(
          flightsWithFlightIdentOnFlightDate,
          async ({
            flight_number,
            registration,
            scheduled_out,
            scheduled_in,
            status,
            origin,
            destination,
            aircraft_type,
            operator_icao,
            operator_iata,
            progress_percent,
          }) => {
            return {
              flightNumber: flight_number,
              flightDate: dayjs(scheduled_out).valueOf(),
              airlineICAO: operator_icao,
              airlineIATA: operator_iata,
              aircraftRegistration: registration,
              aircraftType: aircraft_type,
              scheduledOut: scheduled_out,
              scheduledIn: scheduled_in,
              originICAO: origin.code,
              destinationICAO: destination.code,
              status,
              progressPercent: progress_percent,
            };
          }
        );

        return flightsInformation;
      }
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  },

  // Used for searching aircraft details when adding a new aircraft
  flightWithFlightIdent: async ({ flightIdent }) => {
    const flightsWithThisIdentAPIData = await axios.get(
      `${
        process.env.FLIGHTAWARE_API_DOMAIN
      }/flights/${flightIdent.toUpperCase()}`,
      { headers: { "x-apikey": process.env.FLIGHTAWARE_API_KEY } }
    );

    const flightDataFromAPIData =
      flightsWithThisIdentAPIData.data.flights.pop();

    const {
      flight_number,
      scheduled_out,
      operator_icao,
      operator_iata,
      registration,
      aircraft_type,
      estimated_out,
      scheduled_in,
      estimated_in,
      actual_in,
      status,
      origin,
      destination,
      progress_percent,
    } = flightDataFromAPIData;

    const flightInformation = {
      flightNumber: flight_number,
      flightDate: dayjs(scheduled_out).valueOf(),
      airlineICAO: operator_icao,
      airlineIATA: operator_iata,
      aircraftRegistration: registration,
      aircraftType: aircraft_type,
      scheduledOut: dayjs(scheduled_out).valueOf(),
      estimatedOut: dayjs(estimated_out).valueOf(),
      scheduledIn: dayjs(scheduled_in).valueOf(),
      estimatedIn: dayjs(estimated_in).valueOf(),
      actualIn: dayjs(actual_in).valueOf(),
      originICAO: origin.code,
      destinationICAO: destination.code,
      status,
      progressPercent: progress_percent,
    };

    return flightInformation;
  },

  userFlightsOnAircraft: async ({ userId, aircraftId, flightIdToExclude }) => {
    try {
      const userFlights = await Flight.find({
        $and: [{ _id: { $ne: flightIdToExclude } }, { userId }, { aircraftId }],
      }).exec();

      return userFlights;
    } catch (e) {
      return e;
    }
  },
};

export const set = {
  addUserFlight: async ({ userId, userFlight, caption, visibility }) => {
    console.log("Called api");
    const user = await User.findById(userId).exec();

    if (!user) {
      console.log("User not found");
      throw new Error(AppStrings["user-not-found-err-msg"]);
    }

    console.log("User found");
    try {
      let {
        airlineIATA,
        airlineICAO,
        aircraftRegistration,
        aircraftType,
        originICAO,
        destinationICAO,
        scheduledOut,
        flightNumber,
      } = userFlight;

      if (!aircraftRegistration) {
        console.log("No aircraft registration");
        throw new Error(AppStrings["flight-add-fail-no-reg-err-msg"]);
      }

      console.log("Initializing new flight");
      let FlightToAddForUser = new Flight({
        userId,
        flightDate: scheduledOut,
        caption,
        visibility,
      });

      console.log("Initialized new flight");
      console.log(FlightToAddForUser);

      console.log("Looking for aircraft on db");
      let aircraftOnDb = await aircraftGetters.aircraft({
        aircraftRegistration,
      });

      if (!aircraftOnDb) {
        console.log("Aircraft not found, fetching with api");
        const aircraftInformation = await get.flightWithFlightIdent({
          flightIdent: aircraftRegistration,
        });
        console.log("fetched api data");
        console.log(aircraftInformation);

        if (airlineICAO !== aircraftInformation.airlineICAO) {
          console.log("Provided airline not correct");
          airlineICAO = aircraftInformation.airlineICAO;
          console.log(`Set airline to ${airlineICAO}`);
        }

        console.log(`Checking if we support the airline ${airlineICAO}`);
        const airline = await airlineGetters.airline({ airlineICAO });

        if (!airline) {
          console.log("Airline not supported");
          throw new Error(AppStrings["airline-not-supported-err-msg"]);
        }

        console.log("Airline supported");
        if (aircraftType !== aircraftInformation.aircraftType) {
          console.log("Provided aircraft type not correct");
          aircraftType = aircraftInformation.aircraftType;
          console.log(`Set aircraft type to ${aircraftType}`);
        }

        console.log(`Checking if we support the aircraft type ${aircraftType}`);
        const aircraftTypeOnDb = await aircraftGetters.aircraftTypes({
          ICAO: aircraftType,
        });

        if (!aircraftTypeOnDb) {
          console.log(`Aircraft type not supported`);
          throw new Error(AppStrings["aircraft-type-not-supported-err-msg"]);
        }

        console.log("Aircraft type supported, creating aircraft");
        aircraftOnDb = await aircraftSetters.createAircraft({
          aircraftRegistration,
          aircraftType,
          airlineICAO,
        });

        console.log(aircraftOnDb);
        console.log("Aircraft created");
      }

      FlightToAddForUser.airlineId = aircraftOnDb.airlineId;
      FlightToAddForUser.aircraftId = aircraftOnDb._id;

      console.log("Updated flight obj");
      console.log(FlightToAddForUser);

      if (originICAO !== null) {
        const originAirport = await airportGetters.airport({
          airportICAO: originICAO,
        });

        if (originAirport) {
          FlightToAddForUser.flightOriginAirportId = originAirport._id;
        } else {
          throw new Error(AppStrings["airport-not-supported-err-msg"]);
        }
      }

      if (destinationICAO !== null) {
        const destinationAirport = await airportGetters.airport({
          airportICAO: destinationICAO,
        });

        if (destinationAirport) {
          FlightToAddForUser.flightDestinationAirportId =
            destinationAirport._id;
        } else {
          throw new Error(AppStrings["airport-not-supported-err-msg"]);
        }
      }

      if (flightNumber !== null) {
        FlightToAddForUser.flightNumber = flightNumber;
      }

      console.log("Final obj is ");
      console.log(FlightToAddForUser);
      const FlightAddedForUser = await FlightToAddForUser.save();

      console.log("Flight added");
      console.log(FlightAddedForUser);
      return FlightAddedForUser;
    } catch (e) {
      console.log("ERROR");
      console.log(e);
      throw new Error(e);
    }
  },
};
