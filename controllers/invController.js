const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

// Build inventory by classification view
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: className + " Vehicles",
        nav,
        grid
    });
}

invCont.buildByInvId = async function (req, res, next) {
    const inv_id = req.params.invId;
    const data = await invModel.getInventoryByInvId(inv_id);
    const item = await utilities.buildDetailView(data);
    let nav = await utilities.getNav();
    const pageTitle = "Vehicle Details";
    res.render("./inventory/detail", {
        title: pageTitle,
        nav,
        item
    });
}

module.exports = invCont;