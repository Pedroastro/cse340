// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const reviewValidate = require("../utilities/review-validation")

router.get("/login", utilities.handleErrors(accountController.buildLogin));

// route to get register page
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdate))

router.post("/update/",
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.accountUpdate)
)

router.post("/update-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.passwordUpdate)
)

router.get("/logout", utilities.handleErrors(accountController.logout));

router.get("/update-review/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateReview)
)	

router.post("/update-review",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkUpdateReviewData,
  utilities.handleErrors(accountController.updateReview)
)

router.get("/delete-review/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildDeleteReview)
)

router.post("/delete-review",
  utilities.checkLogin,
  utilities.handleErrors(accountController.deleteReview)
)

module.exports = router;