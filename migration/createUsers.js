import mongoose from "mongoose"
import { User } from "../models/UsersModel"
import { asyncForEach } from "../helpers"
import { UsersData } from "../dataSources/UsersData"

export const createUsers = async() => {
  await asyncForEach(UsersData, async({ firstName, lastName, email, password }) => {
    const UserToSave = new User({
      firstName,
      lastName,
      email,
      password
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
