const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var empleadoDB = mongoose.connection.useDb("empleado");

const ongoing_feedback = new Schema({
  sender_id: String,
  reciever_one_id: String,
  org_id: String,
  level: Number,
  comment: String,
  entry_time: { type: Date, default: Date.now },
});
module.exports = empleadoDB.model("ongoing_feedback", ongoing_feedback);
