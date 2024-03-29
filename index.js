let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let app = express();
let morgan = require("morgan");
let mongoose = require("mongoose");
let compression = require("compression");
const jwt = require("jsonwebtoken")
let fileupload = require('express-fileupload')
mongoose.set("strictQuery", false);

const dotenv = require("dotenv");

// dotenv.config({ path: `.env.production` });
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
console.log("PORT:", process.env.PORT);
let mongooseConnect = require("./connect");
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log("Listening on  port " + server.address().port);
});

app.use(fileupload())

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST ,PUT ,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-with,Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});


const jwtValidate = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) return res.sendStatus(401);

    const token = req.headers["authorization"].replace("Bearer ", "");
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err.message);
        return res.sendStatus(403); // Forbidden
      }
      next(); // Move to the next middleware
    });
  } catch (error) {
    console.error("JWT validation error:", error.message);
    return res.sendStatus(403); // Forbidden
  }
};



app.use(morgan("tiny"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(compression());

let Auth = require("./src/routes/auth");
app.use("/auth", Auth);

let ReadExcel = require("./src/routes/read-excel");
app.use("/read-excel", ReadExcel);

let department = require("./src/routes/department");
app.use("/department", department);

let record = require("./src/routes/record");
const fileUpload = require("express-fileupload");
app.use("/record", record);






module.exports = app;
