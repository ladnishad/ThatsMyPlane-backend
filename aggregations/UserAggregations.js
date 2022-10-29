import { User } from "../models/UsersModel"
import { convertStringIdToObjectId } from "../helpers"

export const UserAggregations = {
  "UserAllFlightsAggregation": async ({ userId }) => {
    const pipeline = [
    {
      '$match': {
        '_id': userId
      }
    }, {
      '$project': {
        'firstName': 1,
        'lastName': 1,
        'email': 1,
        'signupDate': 1
      }
    }, {
      '$lookup': {
        'from': 'flights',
        'localField': '_id',
        'foreignField': 'userId',
        'as': 'flight'
      }
    }, {
      '$unwind': {
        'path': '$flight'
      }
    }, {
      '$lookup': {
        'from': 'aircrafts',
        'localField': 'flight.aircraftId',
        'foreignField': '_id',
        'as': 'aircraft'
      }
    }, {
      '$lookup': {
        'from': 'airports',
        'localField': 'flight.flightOriginAirportId',
        'foreignField': '_id',
        'as': 'originAirport'
      }
    }, {
      '$lookup': {
        'from': 'airports',
        'localField': 'flight.flightDestinationAirportId',
        'foreignField': '_id',
        'as': 'destinationAirport'
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
      '$addFields': {
        'aircraft.airlineId': {
          '$toObjectId': '$aircraft.airlineId'
        },
        'aircraft.aircraftTypeId': {
          '$toObjectId': '$aircraft.aircraftTypeId'
        }
      }
    }, {
      '$lookup': {
        'from': 'airlines',
        'localField': 'aircraft.airlineId',
        'foreignField': '_id',
        'as': 'airline'
      }
    }, {
      '$lookup': {
        'from': 'aircrafttypes',
        'localField': 'aircraft.aircraftTypeId',
        'foreignField': '_id',
        'as': 'aircraftType'
      }
    }, {
      '$unwind': {
        'path': '$airline'
      }
    }, {
      '$unwind': {
        'path': '$aircraftType'
      }
    }, {
      '$project': {
        'firstName': 1,
        'lastName': 1,
        'email': 1,
        'signupDate': 1,
        'flight': 1,
        'aircraft': {
          'registrationNum': 1,
          'aircraftType': '$aircraftType'
        },
        'originAirport': 1,
        'destinationAirport': 1,
        'airline': 1
      }
    }
  ]

    try{
      const result = await User.aggregate(pipeline)
      return result
    } catch(e){
      return e
    }
  },
  // getAllUserFlightsByAircrafts aggregation in aircraft aggregations
  
  "getAllUserFlightsByAircraftTypes": async ({ userId }) => {
    const pipeline = [
  {
    '$match': {
      '_id': userId
    }
  }, {
    '$project': {
      'firstName': 1,
      'lastName': 1,
      'email': 1,
      'signupDate': 1
    }
  }, {
    '$lookup': {
      'from': 'flights',
      'localField': '_id',
      'foreignField': 'userId',
      'as': 'flight'
    }
  }, {
    '$unwind': {
      'path': '$flight'
    }
  }, {
    '$lookup': {
      'from': 'aircrafts',
      'localField': 'flight.aircraftId',
      'foreignField': '_id',
      'as': 'aircraft'
    }
  }, {
    '$lookup': {
      'from': 'airports',
      'localField': 'flight.flightOriginAirportId',
      'foreignField': '_id',
      'as': 'originAirport'
    }
  }, {
    '$lookup': {
      'from': 'airports',
      'localField': 'flight.flightDestinationAirportId',
      'foreignField': '_id',
      'as': 'destinationAirport'
    }
  }, {
    '$unwind': {
      'path': '$aircraft'
    }
  }, {
    '$unwind': {
      'path': '$originAirport',
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$unwind': {
      'path': '$destinationAirport',
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$lookup': {
      'from': 'airlines',
      'localField': 'aircraft.airlineId',
      'foreignField': '_id',
      'as': 'airline'
    }
  }, {
    '$lookup': {
      'from': 'aircrafttypes',
      'localField': 'aircraft.aircraftTypeId',
      'foreignField': '_id',
      'as': 'aircraftType'
    }
  }, {
    '$unwind': {
      'path': '$airline'
    }
  }, {
    '$unwind': {
      'path': '$aircraftType'
    }
  }, {
    '$project': {
      'firstName': 1,
      'lastName': 1,
      'email': 1,
      'signupDate': 1,
      'flight': 1,
      'aircraft': {
        'registrationNum': 1,
        'aircraftType': '$aircraftType'
      },
      'originAirport': 1,
      'destinationAirport': 1,
      'airline': 1
    }
  }, {
    '$group': {
      '_id': '$aircraft.aircraftType.ICAO',
      'flights': {
        '$push': '$$ROOT'
      },
      'count': {
        '$sum': 1
      }
    }
  }
]

    try{
      const result = await User.aggregate(pipeline)
      return result
    } catch(e){
      return e
    }
  }
}
