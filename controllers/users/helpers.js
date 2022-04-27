import dotenv from "dotenv";

import { User } from "../../models/UsersModel"
import { AppStrings } from "../../assets/AppStrings"

dotenv.config();

export const get = {
  userById: async({ userId }) => {
    const UserById = await User.findById(userId).exec()

    return UserById
  },
  userByEmail: async({ email }) => {
    const UserByEmail = await User.findOne({ email }).exec()

    return UserByEmail
  }
}

export const set = {
  createUser: async({ firstName, lastName, email, password }) => {
    const userOnDb = await get.userByEmail({ email })

    if(!userOnDb){
      const UserToCreate = new User({
        firstName,
        lastName,
        email,
        password
      })

      try{
        const CreatedUser = await UserToCreate.save()

        return CreatedUser
      } catch(e){
        return e
      }
    }

    throw new Error(AppStrings["user-already-exists-err-msg"])
  }
}
