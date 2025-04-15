const utilities = require('../utilities/index');
const accountModel = require('../models/account-model');
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
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null
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
  const { account_firstname, account_lastname, account_email } = req.body
  const account_id = parseInt(req.body.account_id)
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
  if (updateResult) {
    req.flash("notice", "Your account was successfully updated.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/account-update", {
      title: "My Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

async function passwordUpdate(req, res) {
  let nav = await utilities.getNav()
  const new_password = req.body.account_password
  const account_id = parseInt(req.body.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  console.log(accountData)
  if (accountData) {
    try {
      if (!(await bcrypt.compare(new_password, accountData[0].account_password))) {
        const hashedPassword = await bcrypt.hashSync(new_password, 10)
        const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
        if (updateResult) {
          req.flash("notice", "Your password was successfully updated.")
          res.status(201).redirect("/account/")
        } else {
          req.flash("notice", "Sorry, the update failed.")
          res.status(501).render("account/account-update", {
            title: "My Account",
            nav,
            errors: null,
            account_firstname: accountData[0].account_firstname,
            account_lastname: accountData[0].account_lastname,
            account_email: accountData[0].account_email,
            account_id: accountData[0].account_id
          })
        }
      } else {
        req.flash("notice", "Please use a different password.")
        res.status(400).render("account/account-update", {
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

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildUpdate, accountUpdate, passwordUpdate, logout }