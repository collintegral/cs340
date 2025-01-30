/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require('./database/')

// Required Routes
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute");

// Required Controllers
const baseController = require("./controllers/baseController")
const errController = require("./controllers/errorController")
const bodyParser = require("body-parser")

/* *************
 * Middleware 
************** */
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/* ***********************
 * View Engine & Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(utilities.handleErrors(static));

// Inventory Route
app.use("/inv", utilities.handleErrors(inventoryRoute));

// Account Route
app.use("/account", utilities.handleErrors(accountRoute));

// Error Testing Route
app.use("/error", utilities.handleErrors(errController.footerErr));

// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome));

// FileNotFound Route
app.use(async (req, res, next) => {
  next({status: 404, message: '<p class="notice">Could not find the requested page.</p>'});
});


/* ********************
* Express Error Handler
* Must Come After All Other Middleware
************************************ */
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) {message = err.message;} else {message = '<p class="notice">Something went wrong. Maybe try a different route?';}
    res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
    errors: null
  });
});


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
