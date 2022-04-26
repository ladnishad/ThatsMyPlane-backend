import mongoose from "mongoose"
import { AppStrings } from "../../assets/AppStrings"
import { User } from "../../models/UsersModel"
import { RefreshToken } from "../../models/RefreshTokenModel"
import { get as UserGetters, set as UserSetters } from "./helpers"
import { get as RefreshTokenGetters, set as RefreshTokenSetters } from "../refreshTokens/helpers"

export const SignUpUser = async(req, res) => {
  const { firstName, lastName, email } = req.body

  const existingUser = await UserGetters.userByEmail({ email })

  if(existingUser){
    res.send(AppStrings["user-already-exists-err-msg"])
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

export const LogoutUser = async(req, res) => {
  try{
    const userToLogout = await UserGetters.userById({ userId: req.user._id })

    const logout = await RefreshTokenSetters.deleteRefreshTokensForUser({ userId: req.user._id })

    res.send(AppStrings["user-logout-successful"])
  } catch(e){
    console.log(e)
  }

}
