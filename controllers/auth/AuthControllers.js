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

export const SignUpUser = async(req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) return res.status(400).json({ 'message': AppStrings["user-signup-fields-required"] });

    // check for duplicate usernames in the db
    const duplicate = await UserGetters.userByEmail({ email })
    if (duplicate) return res.status(409).json({ 'message': AppStrings["user-already-exists-err-msg"] });

    // SignUp blocker [TEMP]
    if(email !== process.env.ADMIN_LOGIN){
      return res.status(400).json({ 'message': AppStrings["user-signup-blocked"] });
    }

    try {
        //store the new user
        const CreatedUser = await UserSetters.createUser({ firstName, lastName, email, password })
        res.status(201).json({ 'success': AppStrings["user-signup-successful"] });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

export const LoginUser = async (req, res) => {
  const { email, password } = req.body

  if(!email || !password) {
    return res.status(400).json({ 'message': AppStrings["user-email-password-required"] });
  }

  const UserOnDb = await UserGetters.userByEmail({ email })

  if(!UserOnDb){
    return res.status(404).json({ 'message': AppStrings["user-not-found-err-msg"]});
  }

  const validPassword = await UserOnDb.isValidPassword(password)
  if(validPassword){
    const body = { _id: UserOnDb.id, email: UserOnDb.email }
    const accessToken = await TokenGetters.accessToken({ body })
    const refreshToken = await TokenGetters.refreshToken({ body })

    const decodedRefreshToken = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const addedRefreshToken = await RefreshTokenSetters.addRefreshTokenForUser({ userId: UserOnDb._id, token: refreshToken, expiry: decodedRefreshToken.exp * 1000 })

    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 })
    res.json({ userId: UserOnDb.id, accessToken })

    return res
  }
  return res.status(401).json({ 'message': AppStrings["user-incorrect-credentials"]})
}

export const RefreshUserToken = async(req, res) => {
  const { cookies } = req

  if(!cookies?.jwt) {
    return res.sendStatus(401)
  }
  const refreshToken = cookies.jwt

  const userFromToken = await RefreshTokenGetters.userByRefreshToken({ refreshToken })

  if(!userFromToken){
    return res.sendStatus(403)
  }

  const decodedRefreshToken = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

  if(decodedRefreshToken.user._id !== userFromToken.id){
    return res.sendStatus(403)
  }

  const body = { _id: userFromToken.id, email: userFromToken.email }
  const NewAccessToken = await TokenGetters.accessToken({ body })
  res.json({ userId: userFromToken.id, accessToken: NewAccessToken })

  return res
}
export const LogoutUser = async(req, res) => {
  const { cookies } = req

  if(!cookies?.jwt){
    return res.sendStatus(204)
  }

  const refreshToken = cookies.jwt
  const UserFromRefreshToken = await RefreshTokenGetters.userByRefreshToken({ refreshToken })

  if(!UserFromRefreshToken){
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    return res.sendStatus(204)
  }

  await RefreshTokenSetters.deleteRefreshTokensForUser({ userId: UserFromRefreshToken._id })

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
  res.sendStatus(204)
}
