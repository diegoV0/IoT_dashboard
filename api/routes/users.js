const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//models import
import User from "../models/user.js";

router.get("/new-user", async (req, res) => {
    try {
        const user = await User.create({
            name: "diegovo web dev",
            email: "diego_dev@hotmail.com",
            password: "mortadela123"
          });
          res.json({"status":"success"});
    } catch (error) {
        res.json({"status":"fail"})
    }
  
});

module.exports = router;
