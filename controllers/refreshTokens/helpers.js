import dayjs from "dayjs"
import mongoose from 'mongoose'
import { RefreshToken } from "../../models/RefreshTokenModel"
import { get as UserGetters, set as UserSetters } from "../users/helpers"

export const get = {
  refreshToken: async({ refreshToken }) => {
    try{
      const refreshTokenOnDb = await RefreshToken.findOne({ token: refreshToken }).exec()
      return refreshTokenOnDb
    } catch(e){
      return e
    }
  },
  refreshTokensByUser : async({ userId }) => {
    try{
      const refreshTokens = await RefreshToken.find({ userId }).exec()
      return refreshTokens
    } catch(e){
      return e
    }
  },
  userByRefreshToken : async({ refreshToken }) => {
    try{
      const refreshTokenOnDb = await get.refreshToken({ refreshToken })
      const userFromRefreshToken = await UserGetters.userById({ userId: refreshTokenOnDb.userId })
      return userFromRefreshToken
    } catch(e){
      return e
    }
  }
}

export const set = {
  deleteRefreshTokensForUser: async({ userId }) => {
    try{
      const deleteRefreshTokensForUser = await RefreshToken.deleteMany({ userId }).exec()
      return deleteRefreshTokensForUser
    } catch(e){
      return e
    }
  },
  addRefreshTokenForUser : async({ userId, token, expiry }) => {
    try{
      const deleteRefreshTokensForUser = await set.deleteRefreshTokensForUser({ userId })
      const NewRefreshTokenForUser = new RefreshToken({
        userId,
        token,
        expireAt: dayjs(expiry).toDate()
      })

      const SavedRefreshTokenForUser = await NewRefreshTokenForUser.save()
      return SavedRefreshTokenForUser
    } catch(e){
      return e
    }
  }
}
