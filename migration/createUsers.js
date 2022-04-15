import mongoose from "mongoose"
import { User } from "../models/UsersModel"
import { asyncForEach } from "../helpers"

const usersToAdd = []

export const createUsers = async() => {
  await asyncForEach(usersToAdd, async({ firstName, lastName, email }) => {
    const UserToSave = new User({
      firstName,
      lastName,
      email
    })

    UserToSave.save((err, UserSaved) => {
      if(err){
        console.error(err)
      }
      return UserSaved
    })
  })

  return 1
}
