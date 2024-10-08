const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },
  schedule: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;
