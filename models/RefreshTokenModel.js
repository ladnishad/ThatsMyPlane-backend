import mongoose from "mongoose"

const { Schema, model } = mongoose

export const RefreshTokenSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  token: {
    type: String,
    default: ""
  },
  expiry: Number
})

export const RefreshToken = model("RefreshTokens", RefreshTokenSchema)
