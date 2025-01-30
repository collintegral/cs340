// Required Resources
const express = require('express');
const router = new express.Router();
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');

// Route for My Account view
router.get("/login", accountController.buildLogin);

router.get("/registration", accountController.buildRegistration);

router.post('/register', 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    accountController.registerAccount
);

module.exports = router;