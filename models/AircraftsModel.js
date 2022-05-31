import mongoose from "mongoose"
import { AppStrings } from "../assets/AppStrings"

const { Schema, model } = mongoose

const AircraftsTypeSchema = new Schema({
  ICAO: {
    type: String,
    required: true,
    match: [/^[A-Z]{1}[A-Z0-9]{1,3}$/, AppStrings["aircraft-ICAO-invalid-err-msg"]]
  },
  IATA: {
    type: String,
    default: "",
    match: [/^[A-Z0-9]{3}$/, AppStrings["aircraft-IATA-invalid-err-msg"]]
  },
  model: {
    type: String,
    required: true
  }
})

const AircraftsSchema = new Schema({
  registrationNum: {
    type: String,
    required: true,
    match: [/^[A-Z]-[A-Z]{4}|[A-Z]{2}-[A-Z]{3}|N[0-9]{1,5}[A-Z]{0,2}$/, AppStrings["aircraft-registration-invalid-err-msg"]]
  },
  aircraftTypeId: {
    type: String,
    required: true
  }
})

export const AircraftType = model("AircraftTypes", AircraftsTypeSchema)
export const Aircraft = model("Aircrafts", AircraftsSchema)
