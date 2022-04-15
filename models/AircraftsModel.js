import mongoose from "mongoose"

const { Schema, model } = mongoose

const AircraftsSchema = new Schema({
  registrationNum: {
    type: String,
    required: true
  },
  ICAO: {
    type: String,
    default: ""
  },
  IATA: {
    type: String,
    default: ""
  },
  model: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    default: ""
  },
})

export const Aircraft = model("Aircrafts", AircraftsSchema)
