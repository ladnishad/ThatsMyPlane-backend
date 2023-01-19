import mongoose from "mongoose";
import dayjs from "dayjs";

import { set as NotificationSetters } from "../controllers/notifications/helpers";
import { AppStrings } from "../assets/AppStrings";

const { Schema, model } = mongoose;

const FlightsSchema = new Schema({
  _id: String,
  userId: {
    type: String,
    required: true,
  },
  airlineId: {
    type: String,
    required: true,
  },
  aircraftId: {
    type: String,
    required: true,
  },
  flightNumber: {
    type: String,
    default: "",
  },
  flightDate: {
    type: Number,
    default: 0,
  },
  flightOriginAirportId: {
    type: String,
    default: "",
  },
  flightDestinationAirportId: {
    type: String,
    default: "",
  },
  caption: {
    type: String,
    default: "",
  },
  visibility: {
    type: String,
    enum: ["Private", "Friends", "Public"],
    default: "Private",
  },
});

FlightsSchema.pre("save", async function (next) {
  const _id = mongoose.Types.ObjectId();
  this._id = _id;
  this.wasNew = this.isNew;

  const flightOnDb = await this.constructor
    .findOne({
      $and: [
        { userId: this.userId },
        { aircraftId: this.aircraftId },
        { flightNumber: this.flightNumber },
        { flightDate: this.flightDate },
        { flightOriginAirportId: this.flightOriginAirportId },
        { flightDestinationAirportId: this.flightDestinationAirportId },
      ],
    })
    .exec();

  if (flightOnDb) {
    const err = new Error(AppStrings["flight-already-added-err-msg"]);
    next(err);
  } else {
    next();
  }
});

FlightsSchema.post("save", async function () {
  if (this.wasNew) {
    await NotificationSetters.createNotification({
      actorUserId: this.userId,
    });
  }
});
export const Flight = model("Flights", FlightsSchema);
