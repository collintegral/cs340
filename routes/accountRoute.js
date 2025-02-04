// Required Resources
const express = require('express');
const router = new express.Router();
const accountController = require('../controllers/accountController');
const invController = require('../controllers/invController');
const validate = require('../utilities/account-validation');
const utilities = require('../utilities/')

// Route for My Account view
router.get("/login", accountController.buildLogin);
router.post('/login',
        validate.loginRules(),
        validate.checkLoginData,
        utilities.handleErrors(accountController.loginAccount)
);

router.get("/registration", accountController.buildRegistration);
router.post('/register', 
    validate.registrationRules(),
    validate.checkRegData,
    accountController.registerAccount
);

router.get("/", utilities.checkLogin, invController.buildManagementView);

module.exports = router;