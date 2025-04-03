const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

baseController.buildError = async function(req, res, next){
  const nav = await utilities.getNav()
  const error = new Error("The server has crashed.")
  error.status = 500
  throw error
}

module.exports = baseController