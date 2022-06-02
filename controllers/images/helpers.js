import AWS from "aws-sdk";
import mongoose from "mongoose"
import dotenv from "dotenv";

import { AppStrings } from "../../assets/AppStrings"
import { User } from "../../models/UsersModel"
import { Image } from "../../models/ImagesModel"

import { get as UserGetters, set as UserSetters } from "../users/helpers"

import { asyncMap, convertStringIdToObjectId } from "../../helpers"

dotenv.config();

const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT_PRODUCTION);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_ACCESS_KEY_PRODUCTION,
  secretAccessKey: process.env.SPACES_SECRET_KEY_PRODUCTION,
});

const AWSAccessHelpers = {
  buildParams: async ({ imageFromDatabase, includeContentType=true }) => {
    const { fileName, fileType } = imageFromDatabase

    if(includeContentType){
      return {
        Bucket: process.env.SPACES_NAME_PRODUCTION,
        Key: `${imageFromDatabase.id}/${fileName}`,
        ContentType: fileType
      }
    }
    return {
      Bucket: process.env.SPACES_NAME_PRODUCTION,
      Key: `${imageFromDatabase.id}/${fileName}`
    }
  },
  getUrlForUpload: async ({ imageFromDatabase }) => {
    const params = AWSAccessHelpers.buildParams({ imageFromDatabase })

    try{
      const uploadUrl = await s3.getSignedUrl("putObject", params)

      return {
        ...imageFromDatabase,
        uploadUrl
      }
    } catch(err){
      return err
    }
  },
  getUrlForDownload: async ({ imageFromDatabase }) => {
    const params = AWSAccessHelpers.buildParams({ imageFromDatabase, includeContentType: false })

    try {
      const downloadUrl = await s3.getSignedUrl("getObject", params)

      return {
        ...imageFromDatabase,
        downloadUrl
      }
    } catch(err){
      return err
    }
  },
  getSignedUrl: async ({ imageFromDatabase }) => {
    const params = AWSAccessHelpers.buildParams({ imageFromDatabase })

    try {
      const signedUrl = await s3.getSignedUrl("putObject", params)

      return {
        ...imageFromDatabase,
        signedUrl
      }
    } catch (err){
      return err
    }
  },
  deleteFromSpaces: async({ imageFromDatabase }) => {
    const params = AWSAccessHelpers.buildParams({ imageFromDatabase, includeContentType: false })

    try {
        const delete = await s3.deleteObject(params)
        return delete
    } catch (err){
        return err
    }
  }
}

export const get = {
  filteredImage: async ({ userId, filters }) => {
    if(!userId){
      throw new Error(AppStrings["user-id-param-required-err-msg"])
    }

    try {
      let FoundImage = await Image.find({ $and: [{ userId}, ...filters] }).exec()

      if(FoundImage){
        const ImageWithUrl = await AWSAccessHelpers.getUrlForDownload({ imageFromDatabase: FoundImage })

        return ImageWithUrl
      }
      else{
        throw new Error(AppStrings["image-not-found-err-msg"])
      }
    } catch(e){
      return e
    }
  },
  filteredImages: async ({ userId, filters }) => {
    if(!userId){
      throw new Error(AppStrings["user-id-param-required-err-msg"])
    }

    try {
      const ImagesOnDb = await Image.find({ $and: [{ userId}, ...filters] }).exec()

      const ImagesWithUrl = await asyncMap(ImagesOnDb, async (ImageOnDb) => {
        const ImageWithUrl = await AWSAccessHelpers.getUrlForDownload({ imageFromDatabase: ImageOnDb })

        return ImageWithUrl
      })

      return ImagesWithUrl
    } catch(e){
      return e
    }
  },
  allImagesForUser: async ({ userId }) => {
    if(!userId){
      throw new Error(AppStrings["user-id-param-required-err-msg"])
    }

    try {
      const ImagesOnDb = await Image.find({ userId }).exec()

      const ImagesWithUrl = await asyncMap(ImagesOnDb, async (ImageOnDb) => {
        const ImageWithUrl = await AWSAccessHelpers.getUrlForDownload({ imageFromDatabase: ImageOnDb })

        return ImageWithUrl
      })

      return ImagesWithUrl
    } catch(e){
      return e
    }
  }
}

export const set = {}
