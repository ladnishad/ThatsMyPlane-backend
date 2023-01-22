import mongoose from "mongoose";
import dayjs from "dayjs";

const { Schema, model } = mongoose;

import { set as NotificationSetters } from "../controllers/notifications/helpers";

const NotificationsSchema = new Schema({
  _id: String,
  actorUserId: {
    type: String,
    required: true,
  },
  impactUserIds: {
    type: [String],
  },
  action: {
    type: String,
    enum: ["added"],
  },
  entity: {
    type: String,
    enum: ["flight", "repeatingFlight", "post"],
  },
  timestamp: {
    type: Number,
    default: dayjs().valueOf(),
  },
});

NotificationsSchema.methods = {
  notificationsForUser: async function (userId) {},
  watch: function () {
    const notificationsCollection =
      mongoose.connection.collection("notifications");
    // Listen for changes in the notifications collection
    const changeStream = notificationsCollection.watch();
    return changeStream;
  },
};

NotificationsSchema.pre("save", async function (next) {
  const _id = mongoose.Types.ObjectId();

  this._id = _id;

  next();
});

NotificationsSchema.post("save", async function () {
  //   const notificationToSend = this;
  //   await NotificationSetters.sendNotification({
  //     notification: notificationToSend,
  //   });
});

export const Notification = model("Notifications", NotificationsSchema);
