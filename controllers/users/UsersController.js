import mongoose from "mongoose"
import { AppStrings } from "../../assets/AppStrings"
import { User } from "../../models/UsersModel"
import { RefreshToken } from "../../models/RefreshTokenModel"
import { get as UserGetters, set as UserSetters } from "./helpers"
import { get as RefreshTokenGetters, set as RefreshTokenSetters } from "../refreshTokens/helpers"

export const GetUserProfilePrivate = async(req, res) => {
  const { cookies } = req

  if(!cookies?.jwt) {
    return res.sendStatus(401)
  }
  const refreshToken = cookies.jwt

  try{
    const userFromToken = await RefreshTokenGetters.userByRefreshToken({ refreshToken })

    if(!userFromToken){
      return res.sendStatus(403)
    }
    res.send(userFromToken)
  } catch(e){
    res.send(e)
  }
}
