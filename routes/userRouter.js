const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const isAuth = require("../middleware/isAuth");

// router.get("/", assetController.getallAssets);
// router.get("/:patientID", assetController.getOneAssets);

router.get("/", userController.getAllUsers);

router.get("/:email", userController.getOneUser);
router.post("/", userController.createUser);
router.delete("/", userController.deleteUser);
router.put("/",  userController.updateUser);

// router.put("/aprove/:id", isAuth.isAdmin, assetController.updateassets);





// router.put("/aprove/:id", isAuth.isAdmin, assetController.updateassets);


module.exports = router;