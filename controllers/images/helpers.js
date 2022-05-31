import mongoose from "mongoose"
import { AppStrings } from "../../assets/AppStrings"
import { User } from "../../models/UsersModel"
import { Image } from "../../models/ImagesModel"

import { get as UserGetters, set as UserSetters } from "../users/helpers"

import { convertStringIdToObjectId } from "../../helpers"

export const get = {
  filteredImage: async ({ userId, filters }) => {
    if(!userId){
      // Add to assets
      throw new Error("User ID is required.")
    }

    try {
      const ImageOnDb = await Image.find({ $and: [{ userId}, ...filters] }).exec()
      return ImagesOnDb
    } catch(e){
      return e
    }
  },
  filteredImages: async ({ userId, filters }) => {
    if(!userId){
      // Add to assets
      throw new Error("User ID is required.")
    }

    try {
      const ImageOnDb = await Image.find({ $and: [{ userId}, ...filters] }).exec()
      return ImagesOnDb
    } catch(e){
      return e
    }
  },
  allImages: async ({ userId }) => {
    if(!userId){
      // Add to assets
      throw new Error("User ID is required.")
    }

    try {
      const ImagesOnDb = await Image.find({ userId }).exec()
      return ImagesOnDb
    } catch(e){
      return e
    }
  }
}

export const set = {}
