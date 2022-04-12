import mongoose from "mongoose"
import dayjs from "dayjs";

const { Schema } = mongoose

export const Users = new Schema({
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
