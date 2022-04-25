import { RefreshToken } from "../../models/RefreshTokenModel"

export const get = {
  refreshTokensByUser : async({ userId }) => {
    try{
      const refreshTokens = await RefreshToken.find({ userId }).exec()
      return refreshTokens
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
        expiry
      })

      const SavedRefreshTokenForUser = await NewRefreshTokenForUser.save()
      return SavedRefreshTokenForUser
    } catch(e){
      return e
    }
  }
}
