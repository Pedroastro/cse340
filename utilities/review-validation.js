const utilities = require(".")
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.reviewRules = () => {
    return [
      body("review_screenname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a screen name."),
  
        body("review_text")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide the review text."),
    ]
}

validate.checkReviewData = async (req, res, next) => {
    const { review_screenname, review_text, inv_id} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        const data = await invModel.getInventoryById(inv_id)
        const grid = await utilities.buildVehicleDetail(data[0])
        const reviews = await reviewModel.getReviewsByInventoryId(inv_id)
        let nav = await utilities.getNav()
        const invName = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
        res.render("./inventory/vehicle", {
            title: invName,
            nav,
            grid,
            errors,
            reviews: reviews,
            review_screenname: review_screenname,
            review_text: review_text,
            inv_id: inv_id
        })
      return
    }
    next()
}

validate.checkUpdateReviewData = async (req, res, next) => {
    const { review_text, review_id, review_screenname } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        const reviewData = await reviewModel.getReviewById(review_id)
        let nav = await utilities.getNav()
        res.render("account/update-review", {
            title: "Update Review",
            nav,
            errors,
            review_date: reviewData.rows[0].review_date,
            review_text: review_text,
            review_id: review_id,
            review_screenname: review_screenname,
        })
      return
    }
    next()
}

module.exports = validate