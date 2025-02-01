const util = require(".");
const { body, validationResult } = require("express-validator");
const inventoryModel = require("../models/inventory-model");
const validate = {};

// Requirements for valid classification creation
validate.classificationRules = () => {
    return [
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .matches(/^[a-zA-Z]*$/)
        .withMessage("Classification Name does not meet requirements.")
        .custom(async (classification_name) => {
            const nameExists = await inventoryModel.checkExistingClass(classification_name);
            if (nameExists) {
                throw new Error("This classification already exists.")
            }
        })
    ]
}

validate.inventoryRules = () => {
    return [
        body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .withMessage("Item's Make does not meet requirements."),

        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .withMessage("Item's Model does not meet requirements."),

        body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isLength(4)
        .matches(/\d\d\d\d/)
        .withMessage("Item's Year does not meet requirements."),

        body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 0})
        .matches(/[\d]+/)
        .withMessage("Item's Mileage does not meet requirements."),

        body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .matches(/[1-9][\d]*(\.[\d]{2})?|0|\.[\d][\d]/)
        .withMessage("Item's Price does not meet requirements."),

        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .withMessage("Item's Color does not meet requirements."),

        body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .withMessage("Item's Description does not meet requirements."),

        body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 1})
        .withMessage("Classification does not exist."),
    ]
}

// Check data against rules and return errors, or continue creation if no errors.
validate.checkClassData = async (req, res, next) => {
    const classification_name = req.body;
    let errors = [];
    errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await util.getNav();
        res.render("./inventory/add/classification", {
            errors,
            title: "Add New Classification",
            nav
        });
        return
    }
    next();
}

validate.checkInventoryData = async (req, res, next) => {
    const {inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id } = req.body;
    let errors = [];
    errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await util.getNav();
        const classSelect = await util.buildClassificationSelect();
        res.render("./inventory/add/inventory", {
            errors,
            title: "Add New Inventory",
            classSelect,
            nav,
            inv_make,
            inv_model,
            inv_year,
            inv_miles,
            inv_price,
            inv_color,
            inv_description
        });
        return
    }
    next();
}

module.exports = validate;