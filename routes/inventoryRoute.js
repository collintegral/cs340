// Required Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const validate = require('../utilities/inventory-validation');

// Route for building inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for building detail by item id view
router.get("/detail/:invId", invController.buildByInvId);

router.get("/", invController.buildManagementView);

router.get("/add-class", invController.buildAddClassView);
router.post("/add-class",
    validate.classificationRules(),
    validate.checkClassData,
    invController.newClass
)

router.get("/add-inventory", invController.buildAddInventoryView);
router.post("/add-inventory",
    validate.inventoryRules(),
    validate.checkInventoryData,
    invController.newInventory
)

module.exports = router;