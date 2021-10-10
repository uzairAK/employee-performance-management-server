const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var empleadoDB = mongoose.connection.useDb("empleado");

const employee_score = new Schema({
  org_id: { type: String, required: true },
  one_id: String,
  score: String,
  entry_time: { type: Date, default: Date.now },
  review_cycle: { type: Schema.Types.ObjectId, ref: "performance_review_cycle" },
});
var EmployeeScore = empleadoDB.model("employee_score", employee_score);

//<======================================== employee schema ==================================>
const performance_review_cycle = new Schema({
  name: String,
  review_day: { type: Date, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  competancy_rate: { type: Number, default: 0 },
  goal_rate: { type: Number, default: 0 },
  entry_time: { type: Date, default: Date.now },
  employee: { type: String },
  department: { type: String },
  branch: { type: String },
  org_id: { type: String, required: true },
  assigned_to: { type: String, required: true },
});
var PerformanceReviewCycle = empleadoDB.model("performance_review_cycle", performance_review_cycle);

module.exports = {
  EmployeeScore,
  PerformanceReviewCycle,
};
