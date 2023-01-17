import { startCase } from "lodash";

import { Notification } from "../../models/NotificationsModel";
import { get as UserGetters } from "../users/helpers";
import { sendNotificationToClient } from "../../middlewares/pushNotifications";

import { AppStrings } from "../../assets/AppStrings";

export const get = {
  notificationsForUser: async (userId) => {
    try {
      const notifications = await Notification.find({
        impactUserIds: userId,
      }).exec();

      return notifications;
    } catch (e) {
      return e;
    }
  },
};

export const set = {
  createNotification: async ({
    actorUserId,
    type = "self",
    impactUserIds = [],
    action = "added",
    entity = "flight",
  }) => {
    try {
      const notificationToSet = new Notification({
        actorUserId,
        impactUserIds: type === "self" ? [actorUserId] : impactUserIds,
        action,
        entity,
      });

      const savedNotification = await notificationToSet.save();

      return savedNotification;
    } catch (e) {
      return e;
    }
  },

  sendNotification: async ({ notification }) => {
    const { actorUserId, impactUserIds, action, entity } = notification;

    const actionUser = await UserGetters.userById({ userId: actorUserId });

    let sentNotifications = [];
    await asyncForEach(impactUserIds, async (impactUserId) => {
      const impactUser = await UserGetters.userById({ userId: impactUserId });

      if (impactUser && impactUser?.firebaseToken) {
        const isUserSelf = impactUser?._id === actorUserId;

        const title = `${startCase(action)} a ${
          entity === "flight" || entity === "post" ? entity : "repeating flight"
        }`;
        const notificationData = {
          title,
          body: `${
            isUserSelf
              ? `You ${title}`
              : `${actionUser?.firstName} ${actionUser?.lastName}`
          } ${title}`,
        };

        sendNotificationToClient([impactUser?.firebaseToken], notificationData);

        sentNotifications.push(notificationData);
      }
    });

    return sentNotifications;
  },
};
