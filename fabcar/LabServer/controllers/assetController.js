const { v4: uuidv4 } = require("uuid");

const deleteAssetHelper = require("./helpers/assets/deleteAsset");
const createAssetHelper = require("./helpers/assets/createAsset");
const updateAssetHelper = require("./helpers/assets/updateAsset");
const historyAssetHelper = require("./helpers/assets/getAssetHistory");

const getAllAssetHelper = require("./helpers/assets/getAllAssets");
const getOneAssetHelper = require("./helpers/assets/getOneAsset");
const AssetExists = require("./helpers/assets/AssetExists");
const authMid = require("../middleware/isAuth");
const checkPermition = require('./helpers/assets/checkpermitions');
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

  const info = await AssetExists.assetExist(
    req.params.patientID,
    authMid.decodedToken(req, res, next).id
  );






  // const info = await AssetExists.assetExist(
  //   req.params.patientID,
  //   authMid.decodedToken(req, res, next).id
  // );






  if (info) {


    console.log(await checkPermition.checkPermition(req.params.patientID, authMid.decodedToken(req, res, next).id));

    // if (!await checkPermition.checkPermition(req.params.patientID, authMid.decodedToken(req, res, next).id)) {
    //   res.status(400)
    //     .send({
    //       message: "you don't have access to this route"
    //     });

    //   throw new Error("you don't have access to this route").stack;
    // }



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
  throw new Error("error with  id code : code if false or a  patient with this id don't exsite").stack;
};

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
  console.log(req.body);

  console.log(req.params.patientID);
  const info = await AssetExists.assetExist(
    req.params.patientID,
    authMid.decodedToken(req, res, next).id
  );
  if (info) {
    updateAssetHelper
      .updateAsset(
        req.body,
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
