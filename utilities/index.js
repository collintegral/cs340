const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config;
const Util = {};

/* Constructs nav HTML unordered list */
Util.getNav = async function(req, res, next) {
    let data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Homepage">Home</a></li>';
    data.rows.forEach(row => {
        list += '<li>';
        list += 
            '<a href="/inv/type/' + row.classification_id +
            '" title="See our inventory of ' + row.classification_name +
            ' vehicles">' + row.classification_name + 
            '</a>';
        list += '</li>';
    });
    list += '</ul>';
    return list;
}

/* Build the Classification View HTML */
Util.buildClassificationGrid = async function(data) {
    let grid;
    if (data.length > 0) {
        grid = `<ul id="inv-display">`;
        data.forEach(vehicle => {
            grid += '<li>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + " " + vehicle.inv_model
            + ' details"><img src="' + vehicle.inv_thumbnail
            + '" alt="Image of ' + vehicle.inv_make + " " + vehicle.inv_model
            + ' on SCE Motors" /></a>';
            grid += '<div class="name-price">';
            grid += '<hr />';
            grid += '<h2>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View" '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
            grid += '</h2>';
            grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
            grid += '</div>';
            grid += '</li>';
        })
        grid += '</ul>';
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
}

/* Build the classification select dropdown for new inventory */
Util.buildClassificationSelect = async function(classification_id = 0) {
    let data = await invModel.getClassifications();
    let classList = '<option value="" disabled hidden'
    if (classification_id == 0) {
        classList += ' selected>Choose a Classification</option>';
    } else {
        classList += '>Choose a Classification</option>';
    }

    data.rows.forEach(row => {
        classList += '<option value="' + row.classification_id
        if (classification_id == row.classification_id) {
            classList += '" selected>'+ row.classification_name + '</option>'
        } else {
            classList += '">'+ row.classification_name + '</option>'
        }
    });
;
    return classList;
}

/* Build the detail view HTML */
Util.buildDetailView = async function(vehicle) {
    let item;
    if (vehicle) {
        item = '<div class="detail-view">';
        item += '<img src="' + vehicle.inv_image + '" alt="Image of '
        + vehicle.inv_make + " " + vehicle.inv_model + ' on SCE Motors"'
        + 'class="detail-img"/>';
        item += '<div class="name-price">';
        item += '<h2>' + vehicle.inv_year + ' ' + vehicle.inv_color + ' ' +  vehicle.inv_make + ' ' + vehicle.inv_model + ' ' + '</h2>';
        item += '<span class="detail-span">Miles: ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</span>';
        item += '<span class="detail-span">$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
        item += '<hr />';
        item += '<p>' + vehicle.inv_description + '</p>'
        item += '</div>';
        } else {
        item = '<p class="notice">Sorry, couldn\'t find a vehicle with this ID.</p>';
    }
    return item;
}

/* ************
* Error-Handling Middleware
************ */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

//Token Validity Middleware
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in.");
                    res.clearCookie("jwt");
                    return res.direct("/account/login");
                }
                res.locals.accountData = accountData;
                res.locals.loggedIn = 1;
                next();
            }
        );
    } else {
        next();
    }
}

Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedIn) {
        next();
    } else {
        req.flash("notice", "Please log in.");
        return res.redirect("/account/login");
    }
}

module.exports = Util;