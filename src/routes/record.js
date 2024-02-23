let express = require("express");
let router = express.Router();
var mongoose = require("mongodb");
const { ObjectId } = mongoose;
let axios = require("axios");
const moment = require("moment");
let RECORD = require('../models/record')

router.get("/", async (req, res, next) => {
  try {
    let { department, start, end, mode, sort, employeeCode } = req.query
    let con = [
      {
        $match: {}
      }
    ]
    if (department) {
      department = JSON.parse(department)
      if (department.length > 0)
        con.push({
          $match: {
            department: {
              $in: department
            }
          }
        })
    }
    if (employeeCode && employeeCode!='null') {
      con.push({
        $match: {
          employeeCode: {
            $regex: new RegExp(employeeCode, "i"),
          }
        }
      })
    }
    if (start && end) {
      start = moment(start).startOf('day').toDate()
      end = moment(end).endOf('day').toDate()
      con.push({
        $match: {
          date: {
            $gte: start,
            $lte: end
          }
        }
      })
    } else if (start) {
      start = moment(start).startOf('day').toDate()
      con.push({
        $match: {
          date: {
            $gte: start
          }
        }
      })
    } else if (end) {
      end = moment(end).endOf('day').toDate()
      con.push({
        $match: {
          date: {
            $lte: end
          }
        }
      })
    }
    if (sort) {
      sort = JSON.parse(sort)
      con.push({
        $sort: {
          department: Number(sort)
        }
      })
    }
    const result = await RECORD.aggregate(con)
    if (mode == 'summary') {
      const dataUnique = [...new Map(result.map(item =>
        [item['employeeCode'], item])).values()];
      const foo = dataUnique.map(item => {
        const data = result.filter(r => r.employeeCode == item.employeeCode)
        const totalWH = data.reduce((p, n) => {
          if (n['wh']) {
            let arr = n['wh'].split(':')
            const hh = Number(arr[0])
            const mm = Number(arr[1])
            p.h = p.h + hh
            p.m = p.m + mm
            if (p.m >= 60) {
              p.m = p.m - 60
              p.h = p.h + 1
            }
          }
          return p

        }, {
          h: 0, m: 0
        })
        const totalOT = data.reduce((p, n) => {
          if (n['OT']) {
            let arr = n['OT'].split(':')
            const hh = Number(arr[0])
            const mm = Number(arr[1])
            p.h = p.h + hh
            p.m = p.m + mm
            if (p.m >= 60) {
              p.m = p.m - 60
              p.h = p.h + 1
            }
          }
          return p

        }, {
          h: 0, m: 0
        })
        const totalOT2 = data.reduce((p, n) => {
          if (n['OT2']) {
            let arr = n['OT2'].split(':')
            const hh = Number(arr[0])
            const mm = Number(arr[1])
            p.h = p.h + hh
            p.m = p.m + mm
            if (p.m >= 60) {
              p.m = p.m - 60
              p.h = p.h + 1
            }
          }
          return p

        }, {
          h: 0, m: 0
        })
        const totalOT3 = data.reduce((p, n) => {
          if (n['OT3']) {
            let arr = n['OT3'].split(':')
            const hh = Number(arr[0])
            const mm = Number(arr[1])
            p.h = p.h + hh
            p.m = p.m + mm
            if (p.m >= 60) {
              p.m = p.m - 60
              p.h = p.h + 1
            }
          }
          return p

        }, {
          h: 0, m: 0
        })
        const totalOT4 = data.reduce((p, n) => {
          if (n['OT4']) {
            let arr = n['OT4'].split(':')
            const hh = Number(arr[0])
            const mm = Number(arr[1])
            p.h = p.h + hh
            p.m = p.m + mm
            if (p.m >= 60) {
              p.m = p.m - 60
              p.h = p.h + 1
            }
          }
          return p

        }, {
          h: 0, m: 0
        })
        const totalOT5 = data.reduce((p, n) => {
          if (n['OT5']) {
            let arr = n['OT5'].split(':')
            const hh = Number(arr[0])
            const mm = Number(arr[1])
            p.h = p.h + hh
            p.m = p.m + mm
            if (p.m >= 60) {
              p.m = p.m - 60
              p.h = p.h + 1
            }
          }
          return p

        }, {
          h: 0, m: 0
        })
        let totalAll = [totalWH, totalOT, totalOT2, totalOT3, totalOT4, totalOT5]
        totalAll = totalAll.reduce((p, n) => {
          p.h += n.h
          p.m += n.m
          return p
        }, { h: 0, m: 0 })
        const total = {
          totalWH, totalOT, totalOT2, totalOT3, totalOT4, totalOT5, totalAll
        }
        item.total = total
        return {
          ...item,
          totalWh: convertTimeToString(totalWH),
          totalOT: convertTimeToString(totalOT),
          totalOT2: convertTimeToString(totalOT2),
          totalOT3: convertTimeToString(totalOT3),
          totalOT4: convertTimeToString(totalOT4),
          totalOT5: convertTimeToString(totalOT5),
          totalAll: convertTimeToString(totalAll),
        }
      })

      res.json(foo)
    }

    if (mode == 'detail') {
      res.json(result)
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.sendStatus(500);
  }
});

function fnSumAllUser(p, n) {
  p.h = p.h + n.h
  p.m = p.m + n.m
  return p
}

function convertTimeToString(time) {
  return `${time.h.toString().padStart(2, '0')}:${time.m.toString().padStart(2, '0')}`
}


module.exports = router;
