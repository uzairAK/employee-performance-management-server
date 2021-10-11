const express = require("express");
const mongoose = require("mongoose"),
  Admin = mongoose.mongo.Admin;
const bodyParser = require("body-parser");
var axios = require("axios");
var path = require("path");
var FormData = require("form-data");
var logError = require('munshi');
//routes
const goal_management = require("./routes/goal_management.routes");
const competency_scale = require("./routes/competency_scale.routes");
const ongoing_feedback = require("./routes/ongoing_feedback.routes");
const performance_review = require("./routes/performance_review.routes");
const cycle_calculate = require("./routes/cycle_calculate.routes");
const history = require("./routes/history.routes");
const hr = require("./routes/hr.routes");
//models
const {
  Goal,
  GoalProgress,
  GoalReview,
} = require("./models/goal_managment.modal");

const app = express();
require("dotenv").config();
const port = process.env.PORT || 5015;

//Mongodb connection
mongoose
  .connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("> Connected to mongodb");
  })
  .catch((err) => {
    console.log("Error :" + err);
  });

//midlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use("/goal-management", goal_management);
app.use("/competency-scale", competency_scale);
app.use("/on-going-feedback", ongoing_feedback);
app.use("/performance_review", performance_review);
app.use("/history", history);
app.use("/cycle_calculate", cycle_calculate);
app.use("/hr", hr);

app.get("/", (req, res) => {
  res.send("hello from Employee Performance server :)");
});

app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);
