const util = require(".");
const { body, validationResult } = require("express-validator");
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

// Check data against rules and return errors, or continue registration if no errors
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
    let errors = [];
    errors = validationResult(req);
    console.log(validationResult(req));

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

module.exports = validate;