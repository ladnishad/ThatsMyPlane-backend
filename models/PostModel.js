import mongoose from "mongoose"
import dayjs from "dayjs";

const { Schema, model } = mongoose

const PostSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  aircraftId: {
    type: String,
    default: ""
  },
  airlineId: {
    type: String,
    default: ""
  },
  airportId: {
    type: String,
    default: ""
  },
  message: {
    type: String,
  },
  creationDate: {
    type: Number,
    default: dayjs().valueOf()
  },
})

export const Post = model("Posts", PostSchema)
