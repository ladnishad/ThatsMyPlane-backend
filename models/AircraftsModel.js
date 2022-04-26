import mongoose from "mongoose"

const { Schema, model } = mongoose

const AircraftsTypeSchema = new Schema({
  ICAO: {
    type: String,
    required: true
  },
  IATA: {
    type: String,
    default: ""
  },
  model: {
    type: String,
    required: true
  }
})

const AircraftsSchema = new Schema({
  registrationNum: {
    type: String,
    required: true
  },
  aircraftTypeId: {
    type: String,
    required: true
  }
})

export const AircraftType = model("AircraftTypes", AircraftsTypeSchema)
export const Aircraft = model("Aircrafts", AircraftsSchema)
