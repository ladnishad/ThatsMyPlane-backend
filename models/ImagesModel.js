import mongoose from "mongoose";
import dayjs from "dayjs";

const { Schema, model } = mongoose;

const ImageSchema = new Schema({
  _id: String,
  userId: {
    type: String,
    // required: true,
  },
  imageType: {
    type: String,
    enum: ["profile", "aircraft", "post"],
    required: true,
  },
  caption: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    required: true,
  },
  aircraftId: {
    type: String,
    required: function () {
      return this.imageType === "aircraft";
    },
  },
  isProfilePic: {
    type: Boolean,
    required: function () {
      return this.imageType === "profile";
    },
  },
  airlineId: {
    type: String,
  },
  airportId: {
    type: String,
  },
  userUploaded: {
    type: Boolean,
    required: true,
  },
  uploaded: {
    type: Boolean,
    required: function () {
      return this.userUploaded === true;
    },
  },
  useOnApp: {
    type: Boolean,
    default: false,
  },
  public: {
    type: Boolean,
    default: false,
  },
  friends: {
    type: Boolean,
    default: false,
  },
  fileName: {
    type: String,
    required: function () {
      return this.userUploaded === true;
    },
  },
  fileSize: {
    type: Number,
    required: function () {
      return this.userUploaded === true;
    },
  },
  fileType: {
    type: String,
    required: function () {
      return this.userUploaded === true;
    },
  },
  attached: {
    type: Boolean,
    required: function () {
      return this.userUploaded === true;
    },
  },
  uploadDate: {
    type: Number,
    required: function () {
      return this.userUploaded === true;
    },
    default: dayjs().valueOf(),
  },
});

ImageSchema.pre("save", async function (next) {
  const _id = mongoose.Types.ObjectId();
  this._id = _id;

  next();
});

export const Image = model("Images", ImageSchema);
