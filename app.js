const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const mongoose = require("mongoose");

const app = express();

const userRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const contactRoutes = require('./routes/contacts');
const leadRoutes = require('./routes/leads');
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_UN}:${process.env.DB_PW}@cluster0-hh5l0.mongodb.net/CRM?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.log(err);
    console.log("Connection failed!");
  });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-with, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});


app.use("/api/v1/user", userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/leads', leadRoutes);

module.exports = app;