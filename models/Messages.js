const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    message: {
      type: String,
    },
    from: {
      type: Object,
    },
    sender: {
      type: String,
    },
    time: {
      type: String,
    },
    date: {
      type: String,
    },
    to: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
