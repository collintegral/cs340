// Required Resources
const express = require('express');
const router = new express.Router();
const accountController = require('../controllers/accountController');
const validate = require('../utilities/account-validation');

// Route for My Account view
router.get("/login", accountController.buildLogin);

router.get("/registration", accountController.buildRegistration);

router.post('/register', 
    validate.registrationRules(),
    validate.checkRegData,
    accountController.registerAccount
);

router.post('/login',
    (req, res) => {
        validate.loginRules(),
        validate.checkLoginData,
        accountController.loginAccount
    }
)

module.exports = router;