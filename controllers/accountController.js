const utilities = require("../utilities/index.js");
const accountModel = require("../models/account-model.js");
const accountController = {};

// Deliver Login View
accountController.buildLogin = async function(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    });
}

// Deliver Registration View
accountController.buildRegistration = async function(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/registration", {
        title: "Register",
        nav,
        errors: null
    });
}

// Process Registration
accountController.registerAccount = async function (req, res) {
    let nav = await utilities.getNav();
    const {account_firstname, account_lastname, account_email, account_password} = req.body;

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    );

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, ${account_firstname}, you\'re registered. Please log in.`
        );
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null
        });
    } else {
        req.flash("notice", "Sorry, the registration failed.");
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null
        });
    }
}

module.exports = accountController;