import { Aircraft } from "../models/AircraftsModel"
import { convertStringIdToObjectId } from "../helpers"

const AircraftAllDetailsAggregation = async({ aircraftId }) => {
  const AircraftObjectId = await convertStringIdToObjectId(aircraftId)

  const pipeline = [
    {
      '$match': {
        '_id': AircraftObjectId
      }
    }, {
      '$lookup': {
        'from': 'aircrafttypes',
        'localField': 'aircraftTypeId',
        'foreignField': '_id',
        'as': 'aircraftType'
      }
    }, {
      '$lookup': {
        'from': 'airlines', 
        'localField': 'airlineId',
        'foreignField': '_id',
        'as': 'airline'
      }
    }
  ]

  try{
    const result = await Aircraft.aggregate(pipeline)
    return result
  } catch(e){
    return e
  }
}
