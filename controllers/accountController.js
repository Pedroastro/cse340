const utilities = require('../utilities/index');
const accountModel = require('../models/account-model');
const reviewModel = require('../models/review-model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  }

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildManagement(req, res) {
  const reviews = await reviewModel.getReviewsByAccountId(res.locals.accountData.account_id)
  const reviewsList = await utilities.buildReviewList(reviews)
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    reviews: reviews,
    reviewsList: reviewsList,
  })
}

async function buildUpdate(req, res) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  if (accountData) {
    res.render("account/account-update", {
      title: "My Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    })
  } else {
    req.flash("notice", "Sorry, we could not find that account.")
    res.status(404).redirect("/account/")
  }
}

async function accountUpdate(req, res) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.body.account_id)
  const { account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
  if (updateResult) {
    req.flash("notice", "Your account was successfully updated.")
    res.status(201).redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("/account/account-update", {
      title: "My Account",
      nav,
      errors: null,
      account_id: account_id,
      account_firstname: account_firstname,
      account_lastname: account_lastname,
      account_email: account_email
    })
  }
}

async function passwordUpdate(req, res) {
  let nav = await utilities.getNav()
  const new_password = req.body.account_password
  const account_id = parseInt(req.body.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  if (accountData) {
    try {
      const hashedPassword = await bcrypt.hashSync(new_password, 10)
      const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
      if (updateResult) {
        req.flash("notice", "Your password was successfully updated.")
        res.status(201).redirect("/account/")
      } else {
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("/account/account-update", {
          title: "My Account",
          nav,
          errors: null,
          account_firstname: accountData[0].account_firstname,
          account_lastname: accountData[0].account_lastname,
          account_email: accountData[0].account_email,
          account_id: accountData[0].account_id
        })
      }
    } catch (error) {
      throw new Error('Access Forbidden: ' + error.message)
    }
  } else {
    req.flash("notice", "Sorry, we could not find that account.")
    res.status(404).redirect("/account/")
  }
}

async function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have successfully logged out.");
  res.redirect("/");
}

async function buildUpdateReview(req, res) {
  const review_id = parseInt(req.params.review_id);
  const reviewData = await reviewModel.getReviewById(review_id);
  if (reviewData.rows[0] && reviewData.rows[0].account_id == res.locals.accountData.account_id) {
    let nav = await utilities.getNav();
    res.render("account/update-review", {
      title: "Update Review",
      nav,
      errors: null,
      review_date: reviewData.rows[0].review_date,
      review_text: reviewData.rows[0].review_text,
      review_id: reviewData.rows[0].review_id,
      review_screenname: reviewData.rows[0].review_screenname,
    });
  } else {
    req.flash("notice", "Sorry, we could not find that review.");
    res.status(404).redirect("/account/");
  }
}

async function updateReview(req, res) {
  const review_id = parseInt(req.body.review_id);
  const { review_text, review_screenname } = req.body;
  const reviewData = await reviewModel.getReviewById(review_id);
  const updateResult = await reviewModel.updateReview(review_screenname, review_text, review_id);
  if (updateResult) {
    req.flash("notice", "Your review was successfully updated.");
    res.status(201).redirect("/account/");
  } else {
    let nav = await utilities.getNav();
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("/account/update-review", {
      title: "Update Review",
      nav,
      errors: null,
      review_id: review_id,
      review_text: review_text,
      review_date: reviewData.rows[0].review_date,
      review_screenname: review_screenname
    });
  }
}

async function buildDeleteReview(req, res) {
  const review_id = parseInt(req.params.review_id);
  const reviewData = await reviewModel.getReviewById(review_id);
  if (reviewData.rows[0] && reviewData.rows[0].account_id == res.locals.accountData.account_id) {
    let nav = await utilities.getNav();
    res.render("account/delete-review", {
      title: "Delete Review",
      nav,
      errors: null,
      review_date: reviewData.rows[0].review_date,
      review_text: reviewData.rows[0].review_text,
      review_id: reviewData.rows[0].review_id,
      review_screenname: reviewData.rows[0].review_screenname,
    });
  } else {
    req.flash("notice", "Sorry, we could not find that review.");
    res.status(404).redirect("/account/");
  }
}

async function deleteReview(req, res) {
  const review_id = parseInt(req.body.review_id);
  const reviewData = await reviewModel.getReviewById(review_id);
  if (reviewData.rows[0] && reviewData.rows[0].account_id == res.locals.accountData.account_id) {
    const deleteResult = await reviewModel.deleteReview(review_id);
    if (deleteResult) {
      req.flash("notice", "Your review was successfully deleted.");
      res.status(201).redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      res.status(501).redirect("/account/delete-review/" + review_id);
    }
  } else {
    req.flash("notice", "Sorry, we could not find that review.");
    res.status(404).redirect("/account/");
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildUpdate, accountUpdate, passwordUpdate, logout, buildUpdateReview, updateReview, buildDeleteReview, deleteReview }