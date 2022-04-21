import mongoose from 'mongoose'

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
  location: {
    type: LocationPointSchema,
    index: '2dsphere'
  },
  // latDecimalDegrees: {
  //   type: Number,
  //   required: true
  // },
  // longDecimalDegrees: {
  //   type: Number,
  //   required: true
  // }
})

export const Airport = model('Airports', AirportsSchema)
