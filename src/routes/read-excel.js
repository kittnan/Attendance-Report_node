let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
const fs = require('fs');
const XLSX = require('xlsx');
const moment = require("moment");
const RECORD = require("../models/record");

// readData('../doc/data.csv')

async function readData(filePath) {
  try {
    const client = new mongoose.MongoClient('mongodb://10.200.90.152:27017/working_hours', { useNewUrlParser: true, useUnifiedTopology: true })
    await client.connect()
    const db = client.db('working_hours')
    const collection = db.collection('user_master')
    const user_master = await collection.aggregate([{ $match: {} }]).toArray()
    client.close()
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const workbook = XLSX.read(fileContent, { type: 'string' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    let nowUser
    let arr = []
    const result = data.map(async (item, i) => {
      if (item['__EMPTY_7']) {
        nowUser = {
          employeeCode: item['Employee Daily Attendance Summary - Approved '],
          name: item['__EMPTY'],
          position: item['__EMPTY_7'],
        }
        let code = nowUser.employeeCode
        if (code.includes('TH')) {
          code = code.replace('TH', 'TH0')
        }
        if (code.includes('OP0')) {
          code = code.replace('OP0', 'OP00')
        }

        const user = user_master.find(u => u.employee == code)
        if (user) {
          nowUser['department'] = user.department
        }
      } else {
        let date = item['Employee Daily Attendance Summary - Approved '] ? item['Employee Daily Attendance Summary - Approved '] : null
        if (date) {
          if (typeof date == 'string') {
            date = moment(date, 'DD/MM/YYYY').toDate()
          }
          if (typeof date == 'number') {
            date = ExcelDateToJSDate(date)
            let year = moment(date).format('YYYY')
            let month = moment(date).format('MM')
            let day = moment(date).format('DD')
            const newDate = moment(`${year}-${day}-${month}`)
            date = moment(newDate).toDate()
          }
        }
        const newItem = {
          ...nowUser,
          date: date,
          type: item['__EMPTY'],
          in: item['__EMPTY_2'],
          out: item['__EMPTY_3'],
          to: item['__EMPTY_12'],
          wh: item['__EMPTY_14'],
          leave: item['__EMPTY_15'],
          OT: item['__EMPTY_16'],
          OT2: item['__EMPTY_17'],
          OT3: item['__EMPTY_18'],
          OT4: item['__EMPTY_19'],
          OT5: item['__EMPTY_20'],

        }
        arr.push({
          insertOne: {
            document: newItem
          }
        })
      }

      if (i + 1 == data.length) {
        return await RECORD.bulkWrite(arr)
      }
    })
    return result
  } catch (error) {
    console.log("🚀 ~ error:", error)
  }
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569) * 86400 * 1000));
}

// Define routes to handle file uploads
router.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.sendStatus(400).send('No files were uploaded.');
  }

  const uploadedFile = req.files.uploadedFile;

  // Use the mv() method to save the file to a designated location
  uploadedFile.mv('C:/@Develop/Working hours GA/WorkingHoursGA_node/src/doc/data3.csv', async (err) => {
    if (err) {
      return res.sendStatus(500)
    }
    const result = await readData('C:/@Develop/Working hours GA/WorkingHoursGA_node/src/doc/data3.csv')
    res.json({ok:200})
  });
});

module.exports = router;
