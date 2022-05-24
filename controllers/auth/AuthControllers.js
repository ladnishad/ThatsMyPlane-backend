import mongoose from "mongoose"
import passport from "passport"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import { AppStrings } from "../../assets/AppStrings"
import { User } from "../../models/UsersModel"
import { RefreshToken } from "../../models/RefreshTokenModel"
import { get as UserGetters, set as UserSetters } from "../users/helpers"
import { get as RefreshTokenGetters, set as RefreshTokenSetters } from "../refreshTokens/helpers"
import { get as TokenGetters } from "./helpers"

dotenv.config();

export const SignUpUser = async(req, res) => {}

export const LoginUser = async (req, res) => {
  console.log(`New login hit`);

  console.log(req.body);
  const { email, password } = req.body

  if(!email || !password) {
    return res.status(400).json({ 'message': AppStrings["user-email-password-required"] });
  }

  const UserOnDb = await UserGetters.userByEmail({ email })

  if(!UserOnDb){
    return res.sendStatus(404).json({ 'message': AppStrings["user-not-found-err-msg"]});
  }

  const validPassword = await UserOnDb.isValidPassword(password)
  if(validPassword){
    const body = { _id: UserOnDb.id, email: UserOnDb.email }
    const accessToken = await TokenGetters.accessToken({ body })
    const refreshToken = await TokenGetters.refreshToken({ body })

    const decodedRefreshToken = await jwt.verify(refreshToken, process.env.PASSPORT_LOCAL_REFRESH_SECRET)
    const addedRefreshToken = await RefreshTokenSetters.addRefreshTokenForUser({ userId: UserOnDb._id, token: refreshToken, expiry: decodedRefreshToken.exp * 1000 })

    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 })
    res.json({ accessToken })

    return res
  }
  return res.sendStatus(401)
}

export const RefreshUserToken = async(req, res) => {
  const { cookies } = req

  if(!cookies?.jwt) return res.sendStatus(401)

  const refreshToken = cookies.jwt

  const userFromToken = await RefreshTokenGetters.userByRefreshToken({ refreshToken })

  if(!userFromToken) return res.sendStatus(403)

  const decodedRefreshToken = await jwt.verify(refreshToken, process.env.PASSPORT_LOCAL_REFRESH_SECRET)

  if(decodedRefreshToken.user._id !== userFromToken._id){
    return res.sendStatus(403)
  }

  const body = { _id: userFromToken.id, email: userFromToken.email }
  const NewAccessToken = await TokenGetters.accessToken({ body })
  res.json({ accessToken: NewAccessToken })

  return res
}
export const LogoutUser = async(req, res) => {}
