export const TestGetAPI = async (req, res) => {
  console.log("Test API hit")
  console.log(req.body)

  res.json(req.body)

  return res
}

export const TestPostAPI = async (req, res) => {
  console.log("Test API post hit")
  console.log(req.body)

  res.json("OK")

  return res

}
