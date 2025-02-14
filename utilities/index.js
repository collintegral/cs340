const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
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
        item += '<p>' + vehicle.inv_description + '</p>';
        item += `<div class="tools"><a href="/inv/detail/${vehicle.inv_id}/offer" class="offer-btn">Make An Offer</a></div>`;
        
        item += '</div>';
        } else {
        item = '<p class="notice">Sorry, couldn\'t find a vehicle with this ID.</p>';
    }
    return item;
}

Util.buildOfferView = async function(vehicle) {
    let item;
    if (vehicle) {
        item = `<div class="detail-view offer-div">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on SCE Motors" class="detail-img offer-img"/>
        <div class="offer-vehicle-details">
        <div class="offer-vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_color} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <span class="detail-span offer-span">Miles: ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</span>
        <span class="detail-span offer-span">Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
        </div>
        <hr />
        <p>${vehicle.inv_description}</p>
        </div>
        </div>`;
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
                res.locals.loggedIn = 1
                res.locals.account_type = accountData.account_type;
                res.locals.account_firstname = accountData.account_firstname;
                res.locals.account_id = accountData.account_id;
                next();
            }
        );
    } else {
        next();
    }
}

Util.getLoginTools = (req, res, next) => {
    let loginTools ="";
    if (res.locals.loggedIn) {
        loginTools = '<a title="Click to Access your Account" href="/account">Account</a><a title="Click to Log Out" href="/account/logout">Log Out</a>';
    } else {
        loginTools = '<a title="Click to Register" href="/account/register">Register</a><a title="Click to Log In" href="/account/login">Log In</a>';
    }
    res.locals.loginTools = loginTools;
    next();
}


Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedIn) {
        next();
    } else {
        req.flash("notice", "Please log in.");
        return res.redirect("/account/login");
    }
}

Util.checkAccountPermissions = (req, res, next) => {
    let accountTools = "";
    if (res.locals.account_type === 'Employee' || res.locals.account_type === 'Admin') {
        accountTools += '<a title="Click for Inventory Management" href="/inv/manage">Manage Inventory</a>'
    }
    accountTools += `<a title="Click for Offer History" href="/account/offer-history">Offer History</a>
    <a title="Click to Update Account" href="/account/update">Update Account</a>
    <a title="Click to Log Out" href="/account/logout">Log Out</a>`;
    res.locals.accountTools = accountTools;
    next();
}

Util.defendPermissions = (req, res, next) => {
    if (res.locals.account_type === 'Employee' || res.locals.account_type === 'Admin') {
        next();
    } else {
        req.flash("notice", "You do not have access to this function. If this is in error, please contact your local admin.");
        return res.redirect("/account");
    }
}

Util.objOfferHistory = async function(account_id) {
let currentOffers = await accountModel.getOfferHistoryById(account_id);
currentOffers = currentOffers[0].account_offers;

    if (currentOffers) {
        let resultsArr = currentOffers.split("||");
        let results = [];
        resultsArr.forEach(result => {
            results.push(result.split(";"));
        });
        return results;
    }
    else {
        return currentOffers;
    }
}

Util.buildOfferHistoryGrid = async function(offerList) {
    let offerViewGrid;
    console.log(offerList);
    if (offerList) {
        offerViewGrid = '<ul id="offer-display">';
        for (const offer of offerList) {
            let offerItem = await invModel.getInventoryByInvId(offer[0]);
            offerViewGrid += `
            <li>
            <section class="offer-image">
            <a href="../../inv/detail/${offerItem.inv_id}" title="View ${offerItem.inv_make} ${offerItem.model} inventory screen">
            <img class="offer-img" src="${offerItem.inv_thumbnail}" alt="Image of ${offerItem.inv_make} ${offerItem.model} on SCE Motors" /></a>
            </section>
            <section class="offer-info">
            <h2 class=offer-title>${offerItem.inv_year} ${offerItem.inv_make} ${offerItem.inv_model}</h2>
            <section class="offer-details">
            <h3>They Asked: $${offerItem.inv_price}</h3>
            <h3>You Offered: $${offer[1]}</h3>
            <h3>Current Status: ${offer[2].toUpperCase()}</h3>
            </section>
            </section>`
        }

        offerViewGrid += '</ul>';

    } else {
        offerViewGrid = '<p class="notice">Sorry, no offers could be found.</p>'
    }
    return offerViewGrid;
}

module.exports = Util;