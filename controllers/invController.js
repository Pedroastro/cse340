const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  try {
    const className = data[0].classification_name
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    return next({status: 404, message: 'Sorry, we appear to have lost that page.'})
  }
}

invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryById(inv_id)
  try {
    const grid = await utilities.buildVehicleDetail(data[0])
    let nav = await utilities.getNav()
    const invName = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
    res.render("./inventory/vehicle", {
      title: invName,
      nav,
      grid,
    })
  } catch (error) {
    return next({status: 404, message: 'Sorry, we appear to have lost that page.'})
  }
}

module.exports = invCont