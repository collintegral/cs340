const util = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const validate = {};

// Requirements for valid account creation
validate.registrationRules = () => {
    return [
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .withMessage("Please provide a first name."),

        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 2})
        .withMessage("Please provide a last name."),

        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email address is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email);
            if (emailExists) {
                throw new Error("An account with this email already exists. Please log in or use a different email.")
            }
        }),

        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage("Password does not meet requirements."),
    ]
}

//Requirements for valid account login
validate.loginRules = () => {
    return [
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email address is required."),

        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage("Password does not meet requirements."),
    ]
}

// Requirements to update user info
validate.updateInfoRules = () => {
    return [
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .withMessage("Please provide a first name."),

        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 2})
        .withMessage("Please provide a last name."),

        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email address is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email);
            if (emailExists) {
                throw new Error("An account with this email already exists. Please use a different email.")
            }
        })
    ]
}

validate.updatePasswordRules = () => {
    return [
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .custom(async (account_password, {req}) => {
            const accountData = await accountModel.getAccountById(req.body.account_id);
            if (!accountData) {
                throw new Error("An error occurred. Please try again. If the error persists, please log out and back in.");
            } else {
                try {
                    result = bcrypt.compareSync(account_password, accountData.account_password);
                    console.log(result);
                    if (result) {
                        delete accountData.account_password;
                    } else {
                        throw new Error("Incorrect password.");
                    }
                } catch (error) {
                    throw new Error("An error occurred. Please try again.");
                }
            }
        })
        .withMessage("Incorrect password."),

        body("new_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage("New password does not meet requirements."),

        body("confirm_password")
        .trim()
        .custom(async (confirm_password, {req}) => {
            const new_password = req.body.new_password;
            if (new_password !== confirm_password) {
                throw new Error("Passwords do not match.");
            }
        })
        .withMessage("Passwords must match.")
    ]
}

// Check data against rules and return errors, or continue registration if no errors
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
    let errors = [];
    errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await util.getNav();
        res.render("account/registration", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email
        });
        return;
    }
    next();
}

validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body;
    let errors = [];
    errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await util.getNav();
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email
        });
        return;
    }
    next();
}

validate.checkUpdateInfoData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_id} = req.body;
    let errors = [];
    errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await util.getNav();
        res.render("account/update", {
            errors,
            title: "Update Account",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id
        });
        return;
    }
    next();
}

validate.checkUpdatePasswordData = async (req, res, next) => {
    const {account_password, new_password, confirm_password, account_id} = req.body;
    const account_firstname = res.locals.account_firstname;
    const account_lastname = res.locals.account_lastname;
    const account_email = res.locals.account_email;

    let errors = [];
    errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await util.getNav();
        res.render("account/update", {
            errors,
            title: "Update Account",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id
        });
        return;
    }
    next();
}

module.exports = validate;