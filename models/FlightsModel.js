import mongoose from "mongoose"
import dayjs from "dayjs";

const { Schema } = mongoose

export const Flights = new Schema({
  userId: {
    type: String,
    required: true
  },
  airlineId: {
    type: String,
    required: true
  },
  aircraftId: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  flightDate: {
    type: Number,
    required: true
  },
  flightOriginAirportId: {
    type: String
  },
  flightDestinationAirportId: {
    type: String
  }
})
