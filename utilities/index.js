const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid = ""
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors"></a>'
        grid += '<div class="namePrice">'
        grid += '<hr>'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **************************************
* Build the inventory view HTML
* ************************************ */
Util.buildVehicleDetail = async function(vehicleDetail) {
  let detail = ""
  if (vehicleDetail != undefined) {
  detail += '<div id="vehicle-detail">'
  detail += '<img src="' + vehicleDetail.inv_image + '" alt="Image of ' + vehicleDetail.inv_make + ' ' + vehicleDetail.inv_model + ' on CSE Motors">'
  detail += '<div class="details">'
  detail += '<h2>' + vehicleDetail.inv_make + ' ' + vehicleDetail.inv_model + ' Details</h2>'
  detail += '<ul>'
  detail += '<li><strong>Price:</strong> $' + new Intl.NumberFormat('en-US').format(vehicleDetail.inv_price) + '</li>'
  detail += '<li><strong>Description:</strong> ' + vehicleDetail.inv_description + '</li>'
  detail += '<li><strong>Color:</strong> ' + vehicleDetail.inv_color + '</li>'
  detail += '<li><strong>Miles:</strong> ' + new Intl.NumberFormat('en-US').format(vehicleDetail.inv_miles) + '</li>'
  detail += '</ul>'
  detail += '</div>'
  detail += '</div>'
  }
  else {
    detail += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return detail
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin && (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin")) {
    next();
  } else {
    req.flash("notice", "You do not have permission to access this page.");
    return res.redirect("/account/login");
  }
};

Util.buildReviewList = async function (reviews) {
  let reviewList = ""
  if (reviews.rows.length > 0) {
    reviewList += "<ol>"
    for (const review of reviews.rows) {
      const inventoryInfo = await invModel.getInventoryById(review.inv_id)
      const inventoryName = `${inventoryInfo[0].inv_year} ${inventoryInfo[0].inv_make} ${inventoryInfo[0].inv_model}`
      reviewList += "<li>"
      reviewList += "Reviewed the " + inventoryName + " on " + review.review_date + " | <a href='/account/update-review/" + review.review_id + "'>Edit</a> | <a href='/account/delete-review/" + review.review_id + "'>Delete</a>"
      reviewList += "</li>"
    }
    reviewList += "</ol>"
  } else {
    reviewList += '<p class="notice">No reviews have been added yet.</p>'
  }
  return reviewList
}

module.exports = Util