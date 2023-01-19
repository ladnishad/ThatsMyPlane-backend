import cors from "cors";
import CorsOptions from "../config/corsOptions";
import { Notification } from "../models/NotificationsModel";
import { get as NotificationGetters } from "../controllers/notifications/helpers";

const handleSocket = async (socket, next) => {
  cors(CorsOptions)(socket.request, socket.request.res, next);
  const { userId } = socket?.handshake?.query;

  console.log(`${userId} subscribed`);
  // For user notifications
  let notificationsForUser = await NotificationGetters.notificationsForUser(
    userId
  );

  socket.emit("notificationsForUser", notificationsForUser);

  const changeStream = Notification.watch();

  changeStream.on("change", async (change) => {
    notificationsForUser = await NotificationGetters.notificationsForUser(
      userId
    );
    socket.emit("notificationsForUser", notificationsForUser);
  });

  next();
};

module.exports = handleSocket;
