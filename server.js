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
  // const goal = new Goal({
  //   title: "Ian Fleming",
  //   description: "description",
  //   goal_start: "goal start",
  //   end_period: "end period",
  //   reviewer_id: "reviewer_id",
  // });

  // const goal_progress = new GoalProgress({
  //   comment: "Casino Royale comment 4",
  //   progress: 4,
  //   goal: goal._id, // assign the _id from the goal
  // });

  // const goal_review = new GoalReview({
  //   comment: "Casino Royale comment 4",
  //   rating: 4,
  // });
  // goal.goal_progresses.push(goal_progress._id);
  // goal.goal_review = goal_review._id;

  // goal_progress.save(function (err) {
  //   if (err) return console.log(err);
  //   goal_review.save((err, review) => {
  //     if (err) return console.log(err);
  //     goal.save(function (err, goal) {
  //       if (err) return consoloe.log(err);
  //       console.log("inserted");

  //       Goal.find({})
  //         .populate("goal_progresses")
  //         .populate("goal_review")
  //         .exec(function (err, product) {
  //           if (err) {
  //             return console.log(err);
  //           } else {
  //             res.json(product);
  //           }
  //         });
  //     });
  //   });
  // });

  res.send("hello from simple server :)");
});



// sendErrorToMunshi();
// console.log(__dirname);
// console.log("Main");
// console.log(path.dirname(__dirname));
// console.log(path.basename(__dirname));
// console.log(path.resolve(__dirname));
// console.log(path.normalize("../"));
// console.log("Main2");
// console.log(path.dirname(__filename));
// console.log(path.basename(__filename));
// console.log(path.resolve(__filename));

// console.log("\n\n");
// console.log(path.join("/", path.basename(__dirname) ));

// var data = {
//   origin_trace : {FilePath: path.join("/", path.basename(__dirname) ), FileName: path.basename(__filename), TechLog: ""},
//   other_data: {},
//   nonblocking: 1,
//   one_id: "000000",
//   app_id: "10",
//   case: "SYSTEM_LOGS",
//   error_code: 0,
//   error_title: "Testing from Node Function",
// }
// logError(data);
// sendErrorToMunshi(data);

app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);
