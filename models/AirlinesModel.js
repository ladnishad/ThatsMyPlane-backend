import mongoose from "mongoose"
import { AppStrings } from "../assets/AppStrings"

const { Schema, model } = mongoose

const AirlinesSchema = new Schema({
  IATA: {
    type: String,
    required: true,
    match: [/^[A-Z][\d]|[\d][A-Z]|[A-Z]{2}$/, AppStrings["airline-IATA-invalid-err-msg"]]
  },
  ICAO: {
    type: String,
    required: true,
    match: [/^[A-Z]{3}$/, AppStrings["airline-ICAO-invalid-err-msg"]]
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
