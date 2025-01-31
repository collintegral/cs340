const utilities = require("../utilities/index.js");
const accountModel = require("../models/account-model.js");
const bcrypt = require("bcryptjs");
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

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.');
        res.status(500).render("account/registration", {
            title: "Registration",
            nav,
            errors: null
        });
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
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

// Process Login
accountController.loginAccount = async function (req, res) {
    let nav = await utilities.getNav();
    const {account_email, account_password} = req.body;

    const loginResult = await accountModel.loginAccount(
        account_email,
        account_password
    );

    if (loginResult) {
        req.flash(
            "notice",
            `Congratulations, ${account_firstname}, you\'ve logged in.`
        );
        res.status(201).render("/", {
            title: "Home",
            nav,
            errors: null
        });
    } else {
        req.flash("notice", "Sorry, the login failed.");
        req.status(501).render("account/login", {
            title: "Login",
            nav,
            errors: null
        });
    }
}

module.exports = accountController;