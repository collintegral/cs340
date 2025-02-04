const utilities = require("../utilities/index.js");
const accountModel = require("../models/account-model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
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

    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
        req.flash("notice", "Sorry, the login failed. Please check your credentials.");
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email
        })
        return;
    }
    
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password;
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });

            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000});
            } else {
                res.cookie("jwt", accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000});
            }
            return res.redirect('/account')
        } else {
            req.flash("message notice", "Sorry, the login failed. Please check your credentials.");
            res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email
            });
        }
    } catch (error) {
        throw new Error('Access Forbidden.');
    }
}

accountController.buildAccountView = async function (req, res) {
    let nav = await utilities.getNav();
    res.render('./account/', {
        title: 'Account Page',
        nav,
        errors: null
    });
}

module.exports = accountController;