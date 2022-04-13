import mongoose from "mongoose"
import dayjs from "dayjs";

const { Schema, model } = mongoose

const UsersSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  // TODO: Password
  signupDate: {
    type: Number,
    default: dayjs().valueOf()
  },
})

export const User = model("Users", UsersSchema)
