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

// Log out and return to home
accountController.buildLogout = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.status(202).clearCookie('jwt');
    req.flash("notice", "You've successfully logged out.");
    res.redirect("/");
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

// Deliver account management page view
accountController.buildAccountView = async function (req, res) {
    let nav = await utilities.getNav();
    res.render('./account', {
        title: 'Account',
        nav,
        errors: null
    });
}

accountController.buildAccountUpdateView = async function (req, res) {
    let nav = await utilities.getNav();
    let accountData = await accountModel.getAccountById(res.locals.account_id);
    let account_id = accountData.account_id;
    let account_firstname = accountData.account_firstname;
    let account_lastname = accountData.account_lastname;
    let account_email = accountData.account_email;

    res.render('./account/update', {
        title: 'Update Account',
        nav,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        errors: null
    })
}

accountController.updateAccount = async function (req, res) {
    let nav = await utilities.getNav();
    const {account_firstname, account_lastname, account_email, account_id} = req.body;
    const updateResult = await accountModel.updateAccountInfo(account_firstname, account_lastname, account_email, account_id);
    
    if (updateResult) {
        const account_firstname = updateResult.account_firstname;
        req.flash("notice", `Your account has been successfully updated, ${account_firstname}.`);
        res.redirect("/account");
    } else {
        req.flash("notice", "The update failed.");
        res.render('./account/update', {
            title: 'Update Account',
            nav,
            account_id,
            account_firstname,
            account_lastname,
            errors: null
        });
    }
}

accountController.updatePassword = async function (req, res) {
    let nav = await utilities.getNav();
    const {new_password, account_id} = req.body;
    const accountData = await accountModel.getAccountById(account_id);
    const account_firstname = accountData.account_firstname;
    const account_lastname = accountData.account_lastname;
    const account_email = accountData.account_email;

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hashSync(new_password, 10);
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.');
        res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
            errors: null
        });
    }

    const updateResult = await accountModel.updateAccountPassword(hashedPassword, account_id);

    if (updateResult) {
        req.flash("notice", `Your account has been successfully updated, ${account_firstname}.`);
        res.redirect("/account");
    } else {
        req.flash("notice", "The update failed.");
        res.render('./account/update', {
            title: 'Update Account',
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
            errors: null
        });
    }
}

accountController.buildOfferHistoryView = async function (req, res, next) {
    let nav = await utilities.getNav();
    let account_id = res.locals.account_id;
    
    let offerData = await utilities.objOfferHistory(account_id);
    let offerList = await utilities.buildOfferHistoryGrid(offerData);
    try {
        res.render('./account/offer-history', {
        title: 'Offers',
        nav,
        offerList,
        errors: null
        });
    } catch(error) {
        next(error);
    }
}

module.exports = accountController;