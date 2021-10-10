const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var empleadoDB = mongoose.connection.useDb("empleado");

const question_schema = new Schema({
  org_id: { type: String, required: true },
  department_id: String,
  branch: String,
  question_title: String,
  assignedTo: String,
  review_cycle: { type: Schema.Types.ObjectId, ref: "performance_review_cycle" },
  employee: String,
  entry_time: { type: Date, default: Date.now },
});
var Question = empleadoDB.model("employee_question", question_schema);

//<======================================== employee schema ==================================>
const employee_schema = new Schema({
  one_id: String,
  org_id: { type: String, required: true },
  marks: [
    {
      question: { type: Schema.Types.ObjectId, ref: "employee_question" },
      obtained_marks: String,
    },
  ],
  review_cycle: { type: Schema.Types.ObjectId, ref: "performance_review_cycle" },
  entry_time: { type: Date, default: Date.now },
});
var Employee = empleadoDB.model("employee_obtained_marks", employee_schema);

module.exports = {
  Question,
  Employee,
};
