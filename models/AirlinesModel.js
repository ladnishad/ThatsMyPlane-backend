import mongoose from "mongoose"

const { Schema } = mongoose

export const Airlines = new Schema({
  IATA: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})
