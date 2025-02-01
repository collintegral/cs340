const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

// Build inventory by classification view
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    try {
        const className = data[0].classification_name; 
        res.render("./inventory/classification", {
            title: className + " Vehicles",
            nav,
            grid,
            errors: null
        });
    } catch(error) {
        next(error);
    }
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
        item,
        errors: null
    });
}

invCont.buildManagementView = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
        title: "Manage Inventory",
        nav,
        errors: null
    });
}

invCont.buildAddClassView = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("./inventory/add/classification", {
        title: "Add New Classification",
        nav,
        errors: null
    });
}

invCont.buildAddInventoryView = async function (req, res, next) {
    let nav = await utilities.getNav();
    const classSelect = await utilities.buildClassificationSelect();
    res.render("./inventory/add/inventory", {
        title: "Add New Inventory",
        nav,
        classSelect,
        errors: null
    });
}

invCont.newClass = async function (req, res, next) {
    const classification_name = req.body.classification_name;
    const newClassResult = await invModel.newClassification(classification_name);

    let nav = await utilities.getNav();
    if (newClassResult) {
        req.flash(
            "notice",
            `New classification ${classification_name} added.`
        );
        res.status(201).render('./inventory/management', {
            title: "Manage Inventory",
            nav,
            errors: null
        });
    } else {
        req.flash("notice", "The creation failed.");
        req.status(501).render('./inventory/add/classification', {
            title: "Add New Classification",
            nav,
            errors: null
        });
    }
}

invCont.newInventory = async function (req, res, next) {
    const { inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id } = req.body;
    const inv_image = "/images/vehicles/no-image.png";
    const inv_thumbnail = "/images/vehicles/no-image-tn.png";
    const newInventoryResult = await invModel.newInventory(inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id, inv_image, inv_thumbnail)

    let nav = await utilities.getNav();
    if (newInventoryResult) {
        req.flash(
            "notice",
            `New inventory item ${inv_year} ${inv_make} ${inv_model} added. View it <a href="../../inv/detail/${newInventoryResult.rows[0].inv_id}">Here</a>.`
        );
        res.status(201).render('./inventory/management', {
            title: "Manage Inventory",
            nav,
            errors: null
        });
    } else {
        req.flash("notice", "The creation failed.");
        const classSelect = await utilities.buildClassificationSelect();
        req.status(501).render('./inventory/add/inventory', {
            title: "Add new Inventory",
            classSelect,
            nav,
            errors: null
        });
    }
}

module.exports = invCont;