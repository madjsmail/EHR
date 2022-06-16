const { v4: uuidv4 } = require("uuid");
const fs = require('fs');

const deleteAssetHelper = require("./helpers/assets/deleteAsset");
const createAssetHelper = require("./helpers/assets/createAsset");
const updateAssetHelper = require("./helpers/assets/updateAsset");
const historyAssetHelper = require("./helpers/assets/getAssetHistory");

const getAllAssetHelper = require("./helpers/assets/getAllAssets");
const getOneAssetHelper = require("./helpers/assets/getOneAsset");
const AssetExists = require("./helpers/assets/AssetExists");
const authMid = require("../middleware/isAuth");
const { handleExceptions } = require('winston');
exports.deleteAsset = async (req, res, next) => {
  /**
   * Admin
   */
  try {
    deleteAssetHelper.deleteAsset(req.params.patientID, authMid.decodedToken(req, res, next).id);
    res.json({
      message: "asset deleted",
    });
  } catch (error) {
    res.json({
      message: "error invoking chain code delete method",
    });
    process.exit(1);
  }
};


exports.deleteDocFromRecord = async (req, res, next) => {


  try {
    const info = await AssetExists.assetExist(
      req.params.patientID,
      authMid.decodedToken(req, res, next).id
    );
    if (info) {
      getOneAssetHelper
        .getOneAssets(
          req.params.patientID,
          authMid.decodedToken(req, res, next).id
        )
        .then((data) => {

          console.log(data.doctorsWithpermission);
          return;

        })
        .catch((err) => {
          res.json({
            message: "error invoking chain code",
          });
        });
      return;
    }




  } catch (error) {
    res.json({
      message: "error invoking chain code delete method",
    });
    process.exit(1);
  }
};





exports.postAsset = async (req, res, next) => {
  /***
   *  submitTransaction to the createAssets in chain code
   *  args : patient ID and information  in string
   *  ! need to use JSON.stringify
   *

   */

  console.log(req.body);

  patientID = uuidv4();
  createAssetHelper
    .createAsset(req.body, patientID, authMid.decodedToken(req, res, next).id)
    .then(() => {
      res.json({
        message: "Transaction has been submitted",
      });
    })
    .catch((err) => {
      res.json({
        message: "Failed to submit transaction",
        err: err,
      });
      throw new Error(err).message;
    });
};

exports.getallAssets = async (req, res, next) => {
  // get current user ID
  console.log(authMid.decodedToken(req, res, next));
  getAllAssetHelper
    .getallAssets(authMid.decodedToken(req, res, next).id)
    .then((data) => {
      res.json({
        data: data,
      });
    });
};

exports.getOneAssets = async (req, res, next) => {
  // console.log(
  //   "**************************get one asset ****" + req.params.patientID
  // );

  if (
    !(
      authMid.decodedToken(req, res, next).role == "admin" ||
      req.params.patientID == authMid.decodedToken(req, res, next).id
    )
  ) {
    res.status(401).json({
      message: "you are not allowed this action ",
    });
    throw new Error("you are not allowed this action ").message;
  }
  const info = await AssetExists.assetExist(
    req.params.patientID,
    authMid.decodedToken(req, res, next).id
  );
  if (info) {
    getOneAssetHelper
      .getOneAssets(
        req.params.patientID,
        authMid.decodedToken(req, res, next).id
      )
      .then((data) => {
        res.json({
          message: JSON.parse(data),
        });
      })
      .catch((err) => {
        res.json({
          message: "error invoking chain code",
        });
      });
    return;
  }

  res.json({
    message: "error with  id code : code if false or a  patient with this id don't exsite",
  });
};



/***
 * 
 * USE CASE : Lab-user Can upload a  X-ray photo and update Med record
 * 
 */
exports.updateAsset = async (req, res, next) => {
  // if (
  //   !(
  //     authMid.decodedToken(req, res, next).role == "admin" ||
  //     req.params.patientID == authMid.decodedToken(req, res, next).id
  //   )
  // ) {
  //   res.status(401).json({
  //     message: "you are not allowed this action ",
  //   });
  //   throw new Error("you are not allowed this action ").message;
  // }

  try {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getMinutes();


    // delete old imges save new one
    // track file with date 
    var radioArray = [];

    fullUrl = req.protocol + '://' + req.get('host') + "/uploads/" + req.params.patientID + '/' + date;

    fs.readdirSync('./uploads/' + req.params.patientID + '/' + date).forEach(file => {
      console.log(fullUrl + '/' + file);
      radioArray.push(fullUrl + '/' + file);
    });


    console.log("***********************");
    //console.log(JSON.stringify(fs.readdirSync('./uploads/madjid')));

    console.log(JSON.stringify(radioArray));
  } catch (error) {
    console.error(error);
    res.send({
      message: "error uploading images"
    });
    return new Error(error).message;
    throw new handleExceptions(error.message);
    console.log("");
  }













  // console.log(req.body);

  // console.log(req.params.patientID);
  const info = await AssetExists.assetExist(
    req.params.patientID,
    authMid.decodedToken(req, res, next).id
  );
  if (info) {

    const data = await getOneAssetHelper
      .getOneAssets(
        req.params.patientID,
        authMid.decodedToken(req, res, next).id
      )
      .then((data) => {
        return data;

      })
      .catch((err) => {
        res.json({
          message: "error invoking chain code",
        });
      });

    //    console.log(JSON.parse(data));
    // process.exit(0);


    updatedData = {
      report: req.body.report,
      radio: JSON.stringify(radioArray)
    };

    updateAssetHelper
      .updateAsset(
        data,
        updatedData,
        req.params.patientID,
        authMid.decodedToken(req, res, next).id
      )
      .then(() => {
        res.json({
          message: "Transaction has been submitted",
        });
      })
      .catch((err) => {
        res.json({
          message: "Failed to submit transaction",
          err: err,
        });
        process.exit(1);
      });
    return;
  }

  res.json({
    message: "error with  id code : code if false or a  patient with this id don't exsite",
  });
};

exports.getAssetHistory = async (req, res, next) => {
  // console.log(req.params.patientID.toString().trim());
  if (
    !(
      authMid.decodedToken(req, res, next).role == "admin" ||
      req.params.patientID == authMid.decodedToken(req, res, next).id
    )
  ) {
    res.status(401).json({
      message: "you are not allowed this action ",
    });
    throw new Error("you are not allowed this action ").message;
  }

  const info = await AssetExists.assetExist(
    req.params.patientID,
    authMid.decodedToken(req, res, next).id
  );
  console.log(info);
  if (info) {
    historyAssetHelper
      .getAssetHistory(
        req.params.patientID,
        authMid.decodedToken(req, res, next).id
      )
      .then((data) => {
        console.log(JSON.parse(data));
        res.json({
          message: "Transaction has been submitted",
          data: JSON.parse(data),
        });
      })
      .catch((err) => {
        res.json({
          message: "Failed to submit transaction",
          err: "err",
        });
        throw new Error(err).message;
        process.exit(1);
      });
    return;
  }

  res.json({
    message: "error with  id code : code if false or a  patient with this id don't exsite",
  });
};

exports.addDocPermission = async (req, res, next) => { };
