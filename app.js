const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require("express-rate-limit");
const mongoSanitize = require('express-mongo-sanitize');
const app = express();

const userRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contacts");
const leadRoutes = require("./routes/leads");
const serviceRoutes = require("./routes/service");

mongoose.set("useCreateIndex", true);
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_UN}:${process.env.DB_PW}@cluster0-hh5l0.mongodb.net/CRM?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.log(err);
    console.log("Connection failed!");
  });
  
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss())

const limiter = rateLimit({
  windowMs: 10*60*1000,// 10 mins
  max: 1000
});

app.use(limiter);

app.use(hpp());


// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-with, Content-Type, Accept, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PATCH, PUT, DELETE, OPTIONS"
//   );
//   next();
// });

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/services", serviceRoutes);

module.exports = app;
