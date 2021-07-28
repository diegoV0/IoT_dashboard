const express = require("express");
const { checkAuth } = require("../middlewares/authentication");
const router = express.Router();

/*----------------------------------------------------------
                        Models Included
-------------------------------------------------------------*/
import Device from "../models/device.js";

/*----------------------------------------------------------
                           API
-------------------------------------------------------------*/
router.get("/device", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    const devices = await Device.find({ userId: userId });
    const toSend = {
      status: "success",
      data: devices
    };
    res.json(toSend);
  } catch (error) {
    console.log("ERROR GETTING DEVICES");
    const toSend = {
      status: "error",
      error: error
    };
    return res.status(500).json(toSend);
  }
});

router.post("/device", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    var newDevice = req.body.newDevice;
    newDevice.userId = userId;
    newDevice.createdTime = Date.now();
    const device = await Device.create(newDevice);
    const toSend = {
      status: "success"
    };
    return res.json(toSend);
  } catch (error) {
    console.log("CRETAING NEW DEVICE");
    console.log(error);
    const toSend = {
      status: "error",
      error: error
    };
    return res.status(500).json(toSend);
  }
});

router.delete("/device", (req, res) => {});

router.put("/device", (req, res) => {});

/*----------------------------------------------------------
                           Funtions
-------------------------------------------------------------*/

module.exports = router;
