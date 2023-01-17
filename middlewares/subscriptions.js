import { Notification } from "../models/NotificationsModel";
import { get as NotificationGetters } from "../controllers/notifications/helpers";

const handleSocket = async (socket, next) => {
  const { userId } = socket?.handshake?.query;

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
