import mongoose from "mongoose"

const { Schema } = mongoose

export const Aircrafts = new Schema({
  registrationNum: {
    type: String,
    required: true
  },
  ICAO: {
    type: String,
    required: true
  },
  IATA: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
})
