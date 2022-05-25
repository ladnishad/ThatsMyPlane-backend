import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config();

export const get = {
  accessToken: async({ body }) => {
    const accessToken = await jwt.sign({ user: body }, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRY}` })

    return accessToken
  },
  refreshToken: async({ body }) => {
    const refreshToken = await jwt.sign({ user: body }, process.env.REFRESH_TOKEN_SECRET,{ expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRY}` })

    return refreshToken
  }
}
