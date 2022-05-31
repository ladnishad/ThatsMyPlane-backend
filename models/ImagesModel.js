import mongoose from "mongoose"
import dayjs from "dayjs";

const { Schema, model } = mongoose

const ImageSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  imageType: {
    type: String,
    enum: ["profile", "aircraft"],
    required: true
  },
  aircraftId: {
    type: String,
    required: function () { return this.imageType === "aircraft" }
  },
  isProfilePic: {
    type: Boolean,
    required: function () { return this.imageType === "profile" }
  },
  airlineId: {
    type: String,
  },
  airportId: {
    type: String,
  },
  uploaded: {
    type: Boolean,
    default: false
  },
  useOnApp: {
    type: Boolean,
    default: false
  },
  public: {
    type: Boolean,
    default: false
  },
  friends: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
  },
  attached: {
      type: Boolean,
      default: false,
    },
  uploadDate: {
    type: Number,
    default: dayjs().valueOf()
  },
})

export const Image = model("Images", ImageSchema)
