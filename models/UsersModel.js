import mongoose from "mongoose"
import dayjs from "dayjs";
import bcrypt from 'bcrypt'

const { Schema, model } = mongoose

const UsersSchema = new Schema({
  _id: String,
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  signupDate: {
    type: Number,
    default: dayjs().valueOf()
  },
})

UsersSchema.pre("save", async function(next) {
  const _id = mongoose.Types.ObjectId()

  this._id = _id
  const { password } = this
  const hashedPassword = await bcrypt.hash(password, 10)
  this.password = hashedPassword

  next()
})

UsersSchema.methods = {
  isValidPassword: async function(password){
    const userPassword = this.password
    const compare = await bcrypt.compare(password, userPassword)

    return compare
  }
}

export const User = model("Users", UsersSchema)
