import { Aircraft } from "../models/AircraftsModel"
import { convertStringIdToObjectId } from "../helpers"

const AircraftAllDetailsAggregation = async({ aircraftId }) => {
  const AircraftObjectId = await convertStringIdToObjectId(aircraftId)

  const pipeline = [
    {
      '$match': {
        '_id': AircraftObjectId
      }
    },
    {
      '$project': {
        '_id': 1,
        'registrationNum': 1,
        'aircraftTypeId': {
          '$toObjectId': '$aircraftTypeId'
        },
        'airlineId': {
          '$toObjectId': 'airlineId'
        }
      }
    },
    {
      '$lookup': {
        'from': 'aircrafttypes',
        'localField': 'aircraftTypeId',
        'foreignField': '_id',
        'as': 'aircraftType'
      }
    },
    {
      '$unwind': {
        'path': '$aircraftType'
      }
    },
    {
      '$lookup': {
        'from': 'airlines',
        'localField': 'airlineId',
        'foreignField': '_id',
        'as': 'airline'
      }
    },
    {
      '$unwind': {
        'path': '$airline'
      }
    },
  ]

  try{
    const result = await Aircraft.aggregate(pipeline)
    return result
  } catch(e){
    return e
  }
}
