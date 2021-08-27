const express = require("express");
const { checkAuth } = require("../middlewares/authentication");
const router = express.Router();
const axios = require("axios");

/*----------------------------------------------------------
                        Models Included
-------------------------------------------------------------*/
import Device from "../models/device.js";
import SaverRule from "../models/emqx_saver_rule.js";
import Template from "../models/template.js";

/*----------------------------------------------------------
                           API
-------------------------------------------------------------*/
const auth = {
  auth: {
    username: "admin",
    password: "emqxsecret"
  }
};

//GET DEVICES
router.get("/device", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    //get devices
    var devices = await Device.find({ userId: userId });
    //mongoose array to js array
    devices = JSON.parse(JSON.stringify(devices));
    //get saver rules
    const saverRules = await getSaverRules(userId);
    //get templates
    const templates = await getTemplates(userId);
    //saver rules to -> devices
    devices.forEach((device, index) => {
      devices[index].saverRule = saverRules.filter(saverRule => saverRule.dId == device.dId)[0];
      devices[index].template = templates.filter(template => template._id == device.templateId);
    });
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

//NEW DEVICE
router.post("/device", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    var newDevice = req.body.newDevice;
    newDevice.userId = userId;
    newDevice.createdTime = Date.now();
    await createSaverRule(userId, newDevice.dId, true);
    const device = await Device.create(newDevice);
    await selectDevice(userId, newDevice.dId);
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

//DELETE DEVICE
router.delete("/device", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    const dId = req.query.dId;
    await deleteSaverRule(dId);
    const result = await Device.deleteOne({ userId: userId, dId: dId });
    const toSend = {
      status: "success",
      data: result
    };
    return res.json(toSend);
  } catch (error) {
    console.log("ERROR DELETING DEVICE");
    console.log(error);
    const toSend = {
      status: "error",
      error: error
    };
    return res.status(500).json(toSend);
  }
});

//UPDATE DEVICES (SELECTOR)
router.put("/device", async (req, res) => {
  const dId = req.body.dId;
  const userId = req.userData._id;
  console.log(req.userData._id);
  if (await selectDevice(userId, dId)) {
    const toSend = {
      status: "success"
    };
    return res.json(toSend);
  } else {
    const toSend = {
      status: "error"
    };
    return res.json(toSend);
  }
});

//SAVER-RULE STATUS UPDATER
router.put('/saver-rule', checkAuth, async (req, res) => {
  const rule = req.body.rule;
  console.log(rule)
  await updateSaverRuleStatus(rule.emqxRuleId, rule.status)
  const toSend = {
    status: "success"
  };
  res.json(toSend);
});

/*----------------------------------------------------------
                           Funtions
-------------------------------------------------------------*/
async function selectDevice(userId, dId) {
  try {
    const result = await Device.updateMany(
      { userId: userId },
      { selected: false }
    );
    const result2 = await Device.updateOne(
      { dId: dId, userId: userId },
      { selected: true }
    );
    return true;
  } catch (error) {
    console.log("ERROR IN 'selectDevice' FUNCTION ");
    console.log(error);
    return false;
  }
}


 // SAVER RULES FUNCTIONS

//get templates from a user
async function getTemplates(userId) {
  try {
    const templates = await Template.find({ userId: userId });
    return templates;
  } catch (error) {
    return false;
  }
}

//get saver rules
async function getSaverRules(userId) {
  try {
    const rules = await SaverRule.find({ userId: userId });
    return rules;
  } catch (error) {
    return false;
  }
}

//create saver rule
async function createSaverRule(userId, dId, status) {
  try {
    const url = "http://localhost:8085/api/v4/rules";
    const topic = userId + "/" + dId + "/+/sdata";
    const rawsql =
      'SELECT topic, payload FROM "' + topic + '" WHERE payload.save = 1';
    var newRule = {
      rawsql: rawsql,
      actions: [
        {
          name: "data_to_webserver",
          params: {
            $resource: global.saverResource.id,
            payload_tmpl:
              '{"userId":"' + userId + '","payload":${payload},"topic":"${topic}"}'
          }
        }
      ],
      description: "SAVER-RULE",
      enabled: status
    };
    //save rule in emqx - grabamos la regla en emqx
    const res = await axios.post(url, newRule, auth);
    if (res.status === 200 && res.data.data) {
      console.log(res.data.data);
      await SaverRule.create({
        userId: userId,
        dId: dId,
        emqxRuleId: res.data.data.id,
        status: status
      });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Error creating saver rule");
    console.log(error);
    return false;
  }
}

//update saver rule
async function updateSaverRuleStatus(emqxRuleId, status) {
  const url = "http://localhost:8085/api/v4/rules/" + emqxRuleId;
  const newRule = {
    enabled: status
  };
  const res = await axios.put(url, newRule, auth);
  if (res.status === 200 && res.data.data) {
    await SaverRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status });
    console.log("Saver Rule Status Updated...".green);
    return {
      status: "success",
      action: "updated"
    };
  }
}

//delete saver rule
async function deleteSaverRule(dId) {
  try {
    const mongoRule = await SaverRule.findOne({ dId: dId });
    const url = "http://localhost:8085/api/v4/rules/" + mongoRule.emqxRuleId;
    const emqxRule = await axios.delete(url, auth);
    const deleted = await SaverRule.deleteOne({ dId: dId });
    return true;
  } catch (error) {
    console.log("Error deleting saver rule");
    console.log(error);
    return false;
  }
}

module.exports = router;
