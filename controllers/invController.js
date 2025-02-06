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
    const classificationSelect = await utilities.buildClassificationSelect();
    
    res.render("./inventory/management", {
        title: "Manage Inventory",
        nav,
        classificationSelect,
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
        const classificationSelect = await utilities.buildClassificationSelect();
        res.status(201).render('./inventory/management', {
            title: "Manage Inventory",
            classificationSelect,
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
        const classificationSelect = await utilities.buildClassificationSelect();
        res.status(201).render('./inventory/management', {
            title: "Manage Inventory",
            nav,
            classificationSelect,
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

// Return Inventory by Classification as JSON
invCont.getInventoryJSON = async function (req, res, next) {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (invData[0].inv_id) {
        return res.json(invData);
    } else {
        next(new Error("No data returned."));
    }
}

invCont.buildEditInventoryView = async function (req, res, next) {
    let nav = await utilities.getNav();

    const inventory_id = parseInt(req.params.inventory_id);
    const data = await invModel.getInventoryByInvId(inventory_id);
    const name = `${data.inv_make} ${data.inv_model}`;

    const classSelect = await utilities.buildClassificationSelect(data.classification_id);
    res.render("./inventory/edit/inventory", {
        title: `Edit Inventory: ${name}`,
        nav,
        classSelect,
        inv_id: data.inv_id,
        inv_make: data.inv_make,
        inv_model: data.inv_model,
        inv_year: data.inv_year,
        inv_description: data.inv_description,
        inv_image: data.inv_image,
        inv_thumbnail: data.inv_thumbnail,
        inv_price: data.inv_price,
        inv_miles: data.inv_miles,
        inv_color: data.inv_color,
        errors: null
    });
}

invCont.updateInventory = async function (req, res, next) {
    const { inv_id, inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id } = req.body;
    
    const updateResult = await invModel.updateInventory(inv_id, inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id)

    let nav = await utilities.getNav();
    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model;
        req.flash(
            "notice",
            `${itemName} updated. View it <a href="../../inv/detail/${updateResult.inv_id}">Here</a>.`,
        );
        res.redirect("/inv/");
    } else {
        req.flash("notice", "The update failed.");
        const itemName = inv_make + " " + inv_model;
        const classSelect = await utilities.buildClassificationSelect(classification_id);
        req.status(501).render('./inventory/edit/inventory', {
            title: `Edit Inventory: ${name}`,
            classSelect,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_color,
            errors: null
        });
    }
}

invCont.buildDeleteInventoryView = async function (req, res, next) {
    let nav = await utilities.getNav();

    const inventory_id = parseInt(req.params.inventory_id);
    const data = await invModel.getInventoryByInvId(inventory_id);
    const name = `${data.inv_make} ${data.inv_model}`;

    res.render("./inventory/edit/delete-confirm", {
        title: `Delete Inventory: ${name}`,
        nav,
        inv_id: data.inv_id,
        inv_make: data.inv_make,
        inv_model: data.inv_model,
        inv_year: data.inv_year,
        inv_price: data.inv_price,
        errors: null
    });
}

invCont.deleteInventory = async function (req, res, next) {
    const { inv_id, inv_make, inv_model, inv_year, inv_price } = req.body;
    
    const deleteResult = await invModel.deleteInventory(inv_id);

    let nav = await utilities.getNav();
    if (deleteResult) {
        const itemName = inv_make + " " + inv_model;
        req.flash(
            "notice",
            `${itemName} deleted successfully.`,
        );
        res.redirect("/inv/");
    } else {
        req.flash("notice", "The deletion failed.");
        const itemName = inv_make + " " + inv_model;
        req.status(501).render('./inventory/edit/delete-confirm', {
            title: `Delete Inventory: ${itemName}`,
            classSelect,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
            errors: null
        });
    }
}

module.exports = invCont;