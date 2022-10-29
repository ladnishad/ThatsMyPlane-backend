import { Airport } from "../models/AirportsModel"

export const AirportAggregations = {
  "airports.searchIndexAggregation": async ({ searchParam }) => {
    const pipeline = [
      {
        "$search": {
          "index": "airports_search",
          "text": {
            "query": searchParam,
            "path": {
              "wildcard": "*"
            }
          }
        }
      },
      {
        '$limit': 2
      }
    ]

    try{
      const result = await Airport.aggregate(pipeline)
      return result
    } catch(e){
      return e
    }
  },

  "airports.removeDuplicates": async () => {
    const pipeline = [
      {
        '$group': {
          '_id': {
            'ICAO': '$ICAO'
          },
          'dups': {
            '$addToSet': '$_id'
          },
          'count': {
            '$sum': 1
          }
        }
      }, {
        '$match': {
          'count': {
            '$gt': 1
          }
        }
      }
    ]

    try{
      const result = await Airport.aggregate(pipeline, { allowDiskUse: true })

      let airportsToDelete = []

      result.forEach(duplicateEntry => {
        const { dups } = duplicateEntry
        dups.shift()

        airportsToDelete = [...airportsToDelete, ...dups]
      })

      console.log(`${airportsToDelete.length} entries will be deleted`);

      const deleted = await Airport.deleteMany({ _id: { $in: airportsToDelete } })

      console.log("Finished delete process");
      return 1
    } catch(e){
      return e
    }

  }
}
