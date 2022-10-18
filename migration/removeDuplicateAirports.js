import { AirportAggregations } from "../aggregations/AirportAggregations"

export const removeDuplicateAirports = async () => {
  const removeAgg = await AirportAggregations["airports.removeDuplicates"]()

  return removeAgg
}
