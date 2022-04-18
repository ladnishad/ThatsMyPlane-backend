import dotenv from "dotenv";

import { User } from "../../models/UsersModel"
import { AppStrings } from "../../assets/AppStrings"

dotenv.config();

export const get = {
  userById: async({ userId }) => {
    const UserById = await User.findById(userId).exec()

    return UserById
  }
}
