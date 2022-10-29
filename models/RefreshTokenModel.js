import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config();

const { Schema, model } = mongoose

export const RefreshTokenSchema = new Schema({
  _id: String,
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

RefreshTokenSchema.pre("save", async function(next) {
  const _id = mongoose.Types.ObjectId()
  this._id = _id
  
  next()
})

export const RefreshToken = model("RefreshTokens", RefreshTokenSchema)
