import mongoose from "mongoose"
import { User } from "../models/UsersModel"

export const SignUpUser = async(req, res) => {
  const { firstName, lastName, email } = req.body

  const existingUser = await User.find({ email: email }).exec()
  console.log(existingUser)

  if(existingUser){
    res.send("User with email address already exists")
  }

  else{
    const NewUser = new User({
      firstName,
      lastName,
      email
    })

    NewUser.save((err, User) => {
      if(err){
        res.send(err)
      }
      res.json(User)
    })
  }

}
