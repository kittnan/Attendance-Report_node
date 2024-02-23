let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
let axios = require("axios");

router.get("/departmentOption", async (req, res, next) => {
  try {
    const client = new mongoose.MongoClient('mongodb://10.200.90.152:27017/working_hours', { useNewUrlParser: true, useUnifiedTopology: true })
    await client.connect()
    const db = client.db('working_hours')
    const collection = db.collection('user_master')
    const result = await collection.distinct("department")
    client.close()
    res.json(result)
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});


module.exports = router;
