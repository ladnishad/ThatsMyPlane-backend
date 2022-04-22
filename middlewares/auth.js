import jwt from "express-jwt";
import jwksRsa from "jwks-rsa"
import dotenv from "dotenv";
import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as JWTStrategy, ExtractJwt as ExtractJWT } from "passport-jwt"
import { User } from "../models/UsersModel"
import { get as UserGetters, set as UserSetters } from "../controllers/users/helpers"
import { AppStrings } from "../assets/AppStrings"

dotenv.config();

const PassportConfig = (passport) => {
  // Local Signup
  passport.use("signup", new LocalStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback : true }, async(req, email, password, done) => {
    try{
      const UserCreated = await UserSetters.createUser({ firstName: req.body.firstName, lastName: req.body.lastName, email, password })

      return done(null, UserCreated)
    } catch(e){
      done(e)
    }
  }))

  // Local login
  passport.use("login", new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async(email, password, done) => {
    try{
      const UserOnDb = await UserGetters.userByEmail({ email })

      if(!UserOnDb){
        return done(null, false, { message: AppStrings["user-not-found-err-msg"]})
      }

      const validPassword = await UserOnDb.isValidPassword(password)
      if(!validPassword){
        return done(null, false, { message: AppStrings["user-incorrect-password"]})
      }

      return done(null, UserOnDb, { message: AppStrings["user-login-successful"]})
    } catch(e){
      return done(e)
    }
  }))

  // Local login jwt verify
  passport.use(new JWTStrategy({ secretOrKey: process.env.PASSPORT_LOCAL_LOGIN_SECRET, jwtFromRequest: ExtractJWT.fromHeader("authorization") }, async(token, done) => {
    try{
      return done(null, token.user)
    } catch(e){
      done(e)
    }
  }))
}


export default PassportConfig
