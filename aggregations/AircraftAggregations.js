import { Aircraft } from "../models/AircraftsModel"
import { get as airportGetters } from "../controllers/airports/helpers"
import { asyncMap } from "../helpers"

export const AircraftAggregations = {
  "AircraftAllDetailsAggregation": async({ aircraftId }) => {

    const pipeline = [
      {
        '$match': {
          '_id': aircraftId
        }
      },
      {
        '$project': {
          '_id': 1,
          'registrationNum': 1,
          'aircraftTypeId': 1,
          'airlineId': 1,
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
      {
        '$project': {
            '_id': 1,
            'registrationNum': 1,
            'aircraftType': 1,
            'airline': 1
        }
      }
    ]

    try{
      const result = await Aircraft.aggregate(pipeline)
      return result
    } catch(e){
      return e
    }
  },

  "getAllUserFlightsByAircrafts": async ({ userId }) => {
    const pipeline = [
      {
        '$lookup': {
          'from': 'aircrafttypes',
          'localField': 'aircraftTypeId',
          'foreignField': '_id',
          'as': 'aircraftType'
        }
      }, {
        '$unwind': {
          'path': '$aircraftType',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'airlines',
          'localField': 'airlineId',
          'foreignField': '_id',
          'as': 'airline'
        }
      }, {
        '$unwind': {
          'path': '$airline',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'flights',
          'localField': '_id',
          'foreignField': 'aircraftId',
          'as': 'flights'
        }
      }, {
        '$project': {
          'registrationNum': 1,
          'aircraftType': 1,
          'airline': 1,
          'flights': {
            '$filter': {
              'input': '$flights',
              'as': 'flight',
              'cond': {
                '$eq': [
                  '$$flight.userId', userId
                ]
              }
            }
          }
        }
      }
    ]

    try{
      const aggregateResult = await Aircraft.aggregate(pipeline)

      const processedResult = await asyncMap(aggregateResult, async(eachResult) => {
        let resultFlights = eachResult.flights

        resultFlights = await asyncMap(resultFlights, async({ _id, userId, flightNumber, flightDate, flightOriginalAirportId, flightDestinationAirportId, caption, visibility }) => {
          const originAirport = await airportGetters.airportById({ airportId: flightOriginAirportId })
          const destinationAirport = await airportGetters.airportById({ airportId: flightDestinationAirportId })

          return {
            _id,
            userId,
            flightNumber,
            flightDate,
            originAirport,
            destinationAirport,
            caption,
            visibility
          }
        })

        return resultFlights
      })

      return processedResult
    } catch(e){
      return e
    }
  }
}
