import { User } from "../models/UsersModel"
import { Airline } from "../models/AirlinesModel"
import { AppStrings } from "../assets/AppStrings"

export const AddAirline = async(req, res) => {
  const { userId, admin, IATA, ICAO, name, country } = req.body

  // TODO: AUTH implementation
  if(!admin){
    res.send(AppStrings["user-no-admin-access-err-msg"])
  }

  else{
    const accessingUser = await User.findById(userId)

    if(accessingUser){
      const existingAirline = await Airline.find({ $and: [{ name }, { country }]}).exec()

      if(existingAirline.length){
        res.send(AppStrings["airline-already-exists-err-msg"])
      }
      else{
        const NewAirline = new Airline({
          IATA,
          ICAO,
          name: name.toUpperCase(),
          country: country.toUpperCase()
        })

        NewAirline.save((err, SavedAirline) => {
          if(err){
            res.send(err)
          }
          res.json(SavedAirline)
        })
      }
    }
    else{
      res.send(AppStrings["user-not-logged-in"])
    }

  }
}
