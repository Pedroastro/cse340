const invModel = require("../models/inventory-model")
const Util = require("../utilities/")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  // temporary error handling
  try {
    const className = data[0].classification_name
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      errors: null
    })
  } catch (error) {
    return next({status: 404, message: 'Sorry, we appear to have lost that page.'})
  }
}

invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryById(inv_id)
  // temporary error handling
  try {
    const grid = await utilities.buildVehicleDetail(data[0])
    let nav = await utilities.getNav()
    const invName = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
    res.render("./inventory/vehicle", {
      title: invName,
      nav,
      grid,
      errors: null
    })
  } catch (error) {
    return next({status: 404, message: 'Sorry, we appear to have lost that page.'})
  }
}

invCont.buildManagement = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null
  })
}

invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)
  if (result) {
    req.flash("notice", `Congratulations, ${classification_name} classification has been added.`)
    res.status(201).redirect("/inv")
  } else {
    req.flash("notice", "Sorry, there was an error adding the classification.")
    res.status(500).redirect("/inv/add-classification")
  }
}

invCont.buildAddInventory = async function (req, res) {
  const classificationList = await Util.buildClassificationList()
  let nav = await utilities.getNav()
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null
  })
}

invCont.addInventory = async function (req, res) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  const result = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  if (result) {
    req.flash("notice", `Congratulations, ${inv_make} ${inv_model} has been added.`)
    res.status(201).redirect("/inv")
  } else {
    req.flash("notice", "Sorry, there was an error adding the vehicle.")
    res.status(500).redirect("/inv/add-inventory")
  }
}

module.exports = invCont