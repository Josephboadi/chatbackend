const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    email_verified: {
      type: Boolean,
      required: true,
    },
    auth_time: {
      type: String,
      required: true,
    },
    newMessages: {
      type: Object,
      default: {},
    },
    blockedUsers: [
      {
        type: String,
      },
    ],
    blockedStatus: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "online",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
