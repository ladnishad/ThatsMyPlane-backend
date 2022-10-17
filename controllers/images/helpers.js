import AWS from "aws-sdk";
import mongoose from "mongoose"
import axios from "axios";
import dotenv from "dotenv";

import { AppStrings } from "../../assets/AppStrings"
import { User } from "../../models/UsersModel"
import { Image } from "../../models/ImagesModel"

import { get as UserGetters, set as UserSetters } from "../users/helpers"

import { asyncMap } from "../../helpers"

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
  imageById: async({ userId, imageId }) => {
    if(!userId){
      throw new Error(AppStrings["user-id-param-required-err-msg"])
    }

    if(!imageId){
      throw new Error(AppStrings["image-id-param-required-err-msg"])
    }
    try {
      const ImageByIdOnDb = await Image.findOne({ _id: imageId }).exec()

      return ImageByIdOnDb
    } catch(e){
      return e
    }
  },
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

export const set = {
  createImageOnDb: async ({ userId, ImageDetails }) => {
    if(!userId){
      throw new Error(AppStrings["user-id-param-required-err-msg"])
    }

    try {
      const ImageToBeSavedOnDb = new Image({ userId, ...ImageDetails })

      const SavedImageOnDb = await ImageToBeSavedOnDb.save()

      return SavedImageOnDb
    } catch(e){
      return e
    }
  },
  uploadImage: async ({ userId, ImageDetails, file }) => {
    if(!userId){
      throw new Error(AppStrings["user-id-param-required-err-msg"])
    }

    if(!ImageDetails){
      throw new Error(AppStrings["no-image-details-err-msg"])
    }

    if(!file){
      throw new Error(AppStrings["no-file-to-upload-err-msg"])
    }

    try {
      // Create an entry for the image on the database
      const ImageEntryOnDb = await set.createImageOnDb({ userId, ImageDetails })

      if(!ImageEntryOnDb){
        throw new Error(AppStrings["image-upload-failed-err-msg"])
      }
      // Get the upload url from aws access helpers
      const ImageWithUploadUrl = await AWSAccessHelpers.getUrlForUpload({ imageFromDatabase: ImageEntryOnDb })

      if(!ImageWithUploadUrl){
        throw new Error(AppStrings["image-upload-failed-err-msg"])
      }

      const { uploadUrl } = ImageWithUploadUrl
      // Make an axios request with the image details to the url
      const fileUpload = await axios.put(uploadUrl, file, { headers: { "Content-Type": file.type } })

      if(fileUpload.status !== 200){
        throw new Error(AppStrings["image-upload-failed-err-msg"])
      }
      // Update image entry on database with uploaded: true, attached: true (attached to the user, aircraft)
      ImageEntryOnDb.uploaded = true
      ImageEntryOnDb.attached = true

      const ImageUploadedSaved = await ImageEntryOnDb.save()
      // Return image entry on database with signed/downloadUrl
      const ImageWithDownloadUrl = await AWSAccessHelpers.getUrlForDownload({ imageFromDatabase: ImageUploadedSaved })

      return ImageWithDownloadUrl
    } catch(e){
      return e
    }

  },
  deleteImage: async ({ userId, imageId }) => {
    if(!userId){
      throw new Error(AppStrings["user-id-param-required-err-msg"])
    }

    if(!imageId){
      throw new Error(AppStrings["no-image-to-delete-err-msg"])
    }

    try {
      // Find image on db
      const ImageOnDb = await get.imageById({ userId, imageId})

      if(!ImageOnDb){
        throw new Error(AppStrings["image-not-found-err-msg"])
      }
      // Delete image from spaces using AWSAccessHelpers
      const imageDeletedFromSpaces = await AWSAccessHelpers.deleteFromSpaces({ imageFromDatabase: ImageOnDb })
      // Delete image from database
      const imageDeletedFromDb = await Image.deleteOne({ _id: ImageOnDb._id }).exec()

      return true
    } catch(e){
      return e
    }
  }
}
