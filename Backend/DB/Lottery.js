const mongoose = require("mongoose");

const lotterySchema = new mongoose.Schema({
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
  data: { type: [Number] },
  date: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now, required: true },
  updated_at: { type: Date },
});

// Use this when you want to format the date while displaying
lotterySchema.methods.formatCreatedAt = function () {
  return new Date(this.created_at).toISOString().split("T")[0]; // Formats to YYYY-MM-DD
};

module.exports = mongoose.model("Lottery", lotterySchema);
