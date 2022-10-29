import mongoose from "mongoose"
import dayjs from "dayjs";

const { Schema, model } = mongoose

const PostSchema = new Schema({
  _id: String,
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

PostSchema.pre("save", async function(next) {
  const _id = mongoose.Types.ObjectId()
  this._id = _id
  
  next()
})

export const Post = model("Posts", PostSchema)
