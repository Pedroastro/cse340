const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.classificationRules = () => {
    return [
        // classification name is required and must be string
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isAlphanumeric()
        .isLength({ min: 1 })
        .withMessage("Please provide a classification name.")
    ]
}

validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
        let errors = []
        errors = validationResult(req)
        if (!errors.isEmpty()) {
          let nav = await utilities.getNav()
          res.render("inventory/add-classification", {
            errors,
            title: "Add New Classsification",
            nav,
            classification_name,
          })
          return
        }
    next()
}

module.exports = validate