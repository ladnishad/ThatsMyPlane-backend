import { Airline } from "../models/AirlinesModel"

export const AddAirline = async(req, res) => {
  const { admin, IATA, ICAO, name, country } = req.body

  // TODO: AUTH implementation
  if(!admin){
    res.send("Need admin access")
  }

  else{
    const existingAirline = await Airline.find({ $and: [{ name }, { country }]}).exec()

    if(existingAirline.length){
      res.send("Airline already exists.")
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
}
