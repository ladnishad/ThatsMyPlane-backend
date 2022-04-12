import mongoose from "mongoose"

const { Schema } = mongoose

export const Airports = new Schema({
  ICAO: {
    type: String,
    required: true
  },
  IATA: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
})
