// Required Resources
const express = require('express');
const router = new express.Router();
const utilities = require('../utilities/');
const invController = require('../controllers/invController');
const validate = require('../utilities/inventory-validation');

// Route for building inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for building detail by item id view
router.get("/detail/:invId", invController.buildByInvId);
router.get("/detail/:invId/offer", utilities.checkLogin, invController.buildMakeOfferView);
router.post("/detail/:invId/offer",
    validate.offerRules(),
    validate.checkOfferData,
    invController.newOffer
)

router.get("/manage", utilities.defendPermissions, invController.buildManagementView);

router.get("/manage/add-class", invController.buildAddClassView);
router.post("/manage/add-class",
    validate.classificationRules(),
    validate.checkClassData,
    invController.newClass
)

router.get("/manage/add-inventory", invController.buildAddInventoryView);
router.post("/manage/add-inventory",
    validate.inventoryRules(),
    validate.checkInventoryData,
    invController.newInventory
)

// Fill out inventory table in management form
router.get("/getInventory/:classification_id", invController.getInventoryJSON);

// Edit inventory item
router.get("/manage/edit/:inventory_id", invController.buildEditInventoryView);
router.post("/manage/edit-inventory",
    validate.inventoryRules(),
    validate.checkUpdateData,
    invController.updateInventory);

router.get("/manage/delete/:inventory_id", invController.buildDeleteInventoryView);
router.post("/manage/delete-inventory", invController.deleteInventory);

module.exports = router;