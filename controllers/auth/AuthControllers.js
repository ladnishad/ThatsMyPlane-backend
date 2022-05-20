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
export const LoginUser = async(req, res, next) => {
  passport.authenticate("login", async(err, user, info) => {
    try{
      if(err || !user){
        const error = new Error(AppStrings["some-error"])
        return next(error)
      }

      req.login({user}, { session: false }, async(error) => {
        if(error) {
          return next(error)
        }

        const body = { _id: user.id, email: user.email }

        const token = await TokenGetters.accessToken({ body })
        const refreshToken = await TokenGetters.refreshToken({ body })

        const userOnDb = await UserGetters.userById({ userId: user._id })
        const decodedRefreshToken = await jwt.verify(refreshToken, process.env.PASSPORT_LOCAL_REFRESH_SECRET)

        const addedRefreshToken = await RefreshTokenSetters.addRefreshTokenForUser({ userId: user._id, token: refreshToken, expiry: decodedRefreshToken.exp * 1000 })

        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 })
        res.json({ token })

        return res
      })
    } catch(e){
      return next(e)
    }
  })(req, res, next)
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
  res.json({ token: NewAccessToken })

  return res
}
export const LogoutUser = async(req, res) => {}
