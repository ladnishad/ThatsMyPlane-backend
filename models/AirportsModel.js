import mongoose from 'mongoose'
import { AppStrings } from "../assets/AppStrings"

const { Schema, model } = mongoose

export const LocationPointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
})

const AirportsSchema = new Schema({
  ICAO: {
    type: String,
    required: true,
    match: [/^[A-Z]{4}$/, AppStrings["airport-ICAO-invalid-err-msg"]]
  },
  IATA: {
    type: String,
    required: true,
    match: [/^[A-Z]{3}$/, AppStrings["airport-IATA-invalid-err-msg"]]
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
  location: {
    type: LocationPointSchema,
    index: '2dsphere'
  },
})

export const Airport = model('Airports', AirportsSchema)
