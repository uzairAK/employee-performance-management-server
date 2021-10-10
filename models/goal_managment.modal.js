const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var empleadoDB = mongoose.connection.useDb("empleado");

const goal_schema = new Schema({
  title: String,
  description: String,
  start_period: Date,
  end_period: Date,
  priority: String,
  reviewer_id: String,
  creater_id: String,
  owner_id: String,
  org_id: String,
  review_cycle:String,
  entry_time: { type: Date, default: Date.now },
  goal_progresses: [{ type: Schema.Types.ObjectId, ref: "goal_progress" }],
  goal_review: { type: Schema.Types.ObjectId, ref: "goal_review" },
});

var Goal = empleadoDB.model("goal", goal_schema);

const goal_progress_schema = new Schema({
  comment: String,
  progress: Number,
  entry_time: { type: Date, default: Date.now },
  goal: { type: Schema.Types.ObjectId, ref: "goal" },
});
var GoalProgress = empleadoDB.model("goal_progress", goal_progress_schema);

const goal_review_schema = new Schema({
  comment: String,
  rating: { type: Number, default: 0 },
  entry_time: { type: Date, default: Date.now },
  goal: { type: Schema.Types.ObjectId, ref: "goal" },
});
var GoalReview = empleadoDB.model("goal_review", goal_review_schema);

module.exports = {
  Goal,
  GoalProgress,
  GoalReview,
};
