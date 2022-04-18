import mongoose from "mongoose"
import dayjs from "dayjs";

const { Schema, model } = mongoose

const FlightsSchema = new Schema({
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
    default: 0
  },
  flightOriginAirportId: {
    type: String
  },
  flightDestinationAirportId: {
    type: String
  }
})

export const Flight = model("Flights", FlightsSchema)
