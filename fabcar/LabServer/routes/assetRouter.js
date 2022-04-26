const express = require("express");
const multer = require('multer');
const path = require('path');
const router = express.Router();
const assetController = require("../controllers/assetController");
const isAuth = require("../middleware/isAuth");
const reqValidation = require('../middleware/reqValidation');
const fs = require('fs');








const handleError = (err, res) => {
    res
        .status(500)
        .contentType("text/plain")
        .end("Oops! Something went wrong!");
};


// await fs.promises.mkdir(dirpath, { recursive: true })
const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getMinutes();
        // date = '2022-4-26';

        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads', { recursive: true });
        }

        if (!fs.existsSync('./uploads/' + req.params.patientID + '/' + date)) {
            fs.mkdirSync('./uploads/' + req.params.patientID + '/' + date, { recursive: true });
            cb(null, './uploads/' + req.params.patientID + '/' + date);
        }
        cb(null, './uploads/' + req.params.patientID + '/' + date);




    },

    filename: function (req, file, cb) {
        const targetPath = file.fieldname + '-' + Date.now() + path.extname(file.originalname);// you can change name here
        cb(null, targetPath);


        const tempPath = file.path;



        // if (path.extname(file.originalname).toLowerCase() === ".png") {
        //   fs.rename(tempPath, targetPath, err => {
        //     if (err) return handleError(err, res);

        //     res
        //       .status(200)
        //       .contentType("text/plain")
        //       .end("File uploaded!");
        //   });
        // } else {
        //   fs.unlink(tempPath, err => {
        //     if (err) return handleError(err, res);

        //     res
        //       .status(403)
        //       .contentType("text/plain")
        //       .end("Only .png files are allowed!");
        //   });
        // }

    }
});



const upload = multer({
    dest: "./uploads/*",
    storage: storage,
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'));
        }
        if (ext !== '.png') {
            return callback(new Error('Only PNG images are allowed'));
        }
        callback(null, true);
    },

});










//router.get("/",isAuth.isAdmin, /*isAuth.isAdmin, */assetController.getallAssets);
router.get("/:patientID" /*, isAuth.isOwner*/, assetController.getOneAssets);

//router.post("/exist/:assetID", assetController.assetExists);

//router.post("/",isAuth.isAdmin, assetController.postAsset);
//router.delete("deleteDoc/:patientID", assetController.deleteDocFromRecord);
// upload.array("image" /* name attribute of <file> element in your form */), //single to upload array image
router.put("/:patientID", upload.array("image"), reqValidation.labUpdate, /*, isAuth.isOwner*/assetController.updateAsset);

//router.get("/hest/:patientID", assetController.getAssetHistory);

// router.put("/aprove/:id", isAuth.isAdmin, assetController.updateassets);

module.exports = router;
