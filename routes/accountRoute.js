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

router.get("/", utilities.checkLogin, utilities.checkAccountPermissions, accountController.buildAccountView);

router.get("/update", utilities.checkLogin, accountController.buildAccountUpdateView);
router.post("/update/info",
    validate.updateInfoRules(),
    validate.checkUpdateInfoData,
    accountController.updateAccount
);

router.post("/update/password",
    validate.updatePasswordRules(),
    validate.checkUpdatePasswordData,
    accountController.updatePassword
);

router.get("/logout", accountController.buildLogout);

module.exports = router;