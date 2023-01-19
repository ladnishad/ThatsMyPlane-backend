import { get as NotificationsGetters } from "./helpers"

export const GetUserNotifications = async (req, res) => {
  const { userId } = req.body

  try {
    const notificationsForUser = await NotificationsGetters.notificationsForUser(userId)

    if(notificationsForUser) {
      res.send(notificationsForUser)
    }
    else {
      res.send([])
    }
  } catch (e) {
    res.send(e);
  }
}
