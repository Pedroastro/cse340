// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const classValidate = require("../utilities/add-classification-validation")
const invValidate = require("../utilities/add-inventory-validation")
const utilities = require("../utilities/index")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build by inventory id view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to build management view
router.get("/", 
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement
));

// Route to build add classification view
router.get("/add-classification", 
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification
));

// Route to process add classification
router.post(
  "/add-classification",
  utilities.checkAccountType,
  classValidate.classificationRules(),
  classValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get("/add-inventory",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory
));

// Route to process add inventory
router.post(
  "/add-inventory",
    utilities.checkAccountType,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:invId",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildEditInventory
));

router.post("/edit/",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
);

router.get("/delete/:invId",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteInventory)
);

router.post("/delete/",
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;