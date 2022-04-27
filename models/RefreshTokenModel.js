import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config();

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
  expireAt: {
    type: Date,
    expires: `${process.env.JWT_REFRESH_TOKEN_EXPIRY}`
  }
})

export const RefreshToken = model("RefreshTokens", RefreshTokenSchema)
