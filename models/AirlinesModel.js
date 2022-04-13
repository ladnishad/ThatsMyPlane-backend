import mongoose from "mongoose"

const { Schema, model } = mongoose

const AirlinesSchema = new Schema({
  IATA: {
    type: String,
    required: true
  },
  ICAO: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
})

export const Airline = model("Airlines", AirlinesSchema)
