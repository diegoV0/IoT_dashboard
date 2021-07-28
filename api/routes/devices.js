const express = require("express");
const { checkAuth } = require("../middlewares/authentication");
const router = express.Router();


/*----------------------------------------------------------
                        Models Included
-------------------------------------------------------------*/
import Device from '../models/device.js';

/*----------------------------------------------------------
                           API
-------------------------------------------------------------*/
router.get("/device", checkAuth, (req, res) => {

});

router.post("/device", (req, res) => {
  
});


router.delete("/device", (req, res) => {
  
});


router.put("/device", (req, res) => {
  
});

/*----------------------------------------------------------
                           Funtions
-------------------------------------------------------------*/

module.exports = router;
