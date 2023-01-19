import { Notification } from "../models/NotificationsModel";

export const NotificationAggregations = {
  getUserNotifications: async ({ userId }) => {
    const pipeline = [
      {
        $match: {
          impactUserIds: userId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "actorUserId",
          foreignField: "_id",
          as: "actor",
        },
      },
      {
        $unwind: {
          path: "$actor",
        },
      },
    ];

    try {
      const result = await Notification.aggregate(pipeline);
      return result;
    } catch (e) {
      return e;
    }
  },
};
