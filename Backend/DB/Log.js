const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: {
    type: String, // 'add' or 'update'
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lottery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lottery",
    required: true,
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    required: true,
  },
  old_data: {
    type: [Number],
    default: null,
  },
  new_data: {
    type: [Number],
    required: true,
  },
  updated_at: {
    type: Date,
    default: null,
  },
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
