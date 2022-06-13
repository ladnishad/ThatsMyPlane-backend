import { Flight } from "../models/FlightsModel"
import { convertStringIdToObjectId } from "../helpers"

export const FlightAggregations = {
  "AllFlightsAllDetailsAggregation": async () => {
    const pipeline = [
      {
        '$project': {
          '_id': 1,
          'userId': {
            '$toObjectId': '$userId'
          },
          'airlineId': {
            '$toObjectId': '$airlineId'
          },
          'aircraftId': {
            '$toObjectId': '$aircraftId'
          },
          'flightOriginAirportId': {
            '$toObjectId': '$flightOriginAirportId'
          },
          'flightDestinationAirportId': {
            '$toObjectId': '$flightDestinationAirportId'
          },
          'flightNumber': 1,
          'flightDate': 1
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'userId',
          'foreignField': '_id',
          'as': 'user'
        }
      }, {
        '$lookup': {
          'from': 'airlines',
          'localField': 'airlineId',
          'foreignField': '_id',
          'as': 'airline'
        }
      }, {
        '$lookup': {
          'from': 'aircrafts',
          'localField': 'aircraftId',
          'foreignField': '_id',
          'as': 'aircraft'
        }
      }, {
        '$lookup': {
          'from': 'airports',
          'localField': 'flightOriginAirportId',
          'foreignField': '_id',
          'as': 'originAirport'
        }
      }, {
        '$lookup': {
          'from': 'airports',
          'localField': 'flightDestinationAirportId',
          'foreignField': '_id',
          'as': 'destinationAirport'
        }
      }, {
        '$unwind': {
          'path': '$user'
        }
      }, {
        '$unwind': {
          'path': '$airline'
        }
      }, {
        '$unwind': {
          'path': '$aircraft'
        }
      }, {
        '$unwind': {
          'path': '$originAirport'
        }
      }, {
        '$unwind': {
          'path': '$destinationAirport'
        }
      }, {
        '$project': {
          '_id': 1,
          'flightNumber': 1,
          'user': 1,
          'airline': 1,
          'aircraft': 1,
          'originAirport': 1,
          'destinationAirport': 1
        }
      }
    ]

    try{
      const result = await Flight.aggregate(pipeline)
      return result
    } catch(e){
      return e
    }
  },
  "getAllUserFlightsAllDetailsAggregation": async ({ userId }) => {
    const pipeline = [
      {
        '$match': {
          'userId': userId
        }
      },
      {
        '$project': {
          '_id': 1,
          'userId': {
            '$toObjectId': '$userId'
          },
          'airlineId': {
            '$toObjectId': '$airlineId'
          },
          'aircraftId': {
            '$toObjectId': '$aircraftId'
          },
          'flightOriginAirportId': {
            '$toObjectId': '$flightOriginAirportId'
          },
          'flightDestinationAirportId': {
            '$toObjectId': '$flightDestinationAirportId'
          },
          'flightNumber': 1,
          'flightDate': 1
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'userId',
          'foreignField': '_id',
          'as': 'user'
        }
      }, {
        '$lookup': {
          'from': 'airlines',
          'localField': 'airlineId',
          'foreignField': '_id',
          'as': 'airline'
        }
      }, {
        '$lookup': {
          'from': 'aircrafts',
          'localField': 'aircraftId',
          'foreignField': '_id',
          'as': 'aircraft'
        }
      }, {
        '$lookup': {
          'from': 'airports',
          'localField': 'flightOriginAirportId',
          'foreignField': '_id',
          'as': 'originAirport'
        }
      }, {
        '$lookup': {
          'from': 'airports',
          'localField': 'flightDestinationAirportId',
          'foreignField': '_id',
          'as': 'destinationAirport'
        }
      }, {
        '$unwind': {
          'path': '$user'
        }
      }, {
        '$unwind': {
          'path': '$airline'
        }
      }, {
        '$unwind': {
          'path': '$aircraft'
        }
      }, {
        '$unwind': {
          'path': '$originAirport'
        }
      }, {
        '$unwind': {
          'path': '$destinationAirport'
        }
      }, {
        '$project': {
          '_id': 1,
          'flightNumber': 1,
          'user': 1,
          'airline': 1,
          'aircraft': 1,
          'originAirport': 1,
          'destinationAirport': 1
        }
      }
    ]

    try{
      const result = await Flight.aggregate(pipeline)
      return result
    } catch(e){
      return e
    }
  }
}
