// Required Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');

// Route for building inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for building detail by item id view
router.get("/detail/:invId", invController.buildByInvId);

module.exports = router;