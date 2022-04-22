const Message = require("../models/Messages");
const Users = require("../models/Users");

// Create Message
const createMessage = async (req, res, next) => {
  
  const { userId, myId, message, sender, time, date } = req.body;

  const newMessage = await Message.create({
    message,
    from: sender,
    sender: myId,
    time,
    date,
    to: userId,
  });

  res.status(201).json({
    success: true,
    newMessage,
  });
};

// Get All User Messages
const getAllUserMsg = async (req, res) => {
  const useId = req.params.userId;
  const fromId = req.params.myId;

  async function getLastMessagesByUserId(userId) {
    let privateMessages = await Message.aggregate([
      { $match: { $or: [{ to: userId }, { to: fromId }] } },
      { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
    ]);
    return privateMessages;
  }

  function sortPrivateMessagesByDate(messages) {
    return messages.sort(function (a, b) {
      let date1 = a._id.split("/");
      let date2 = b._id.split("/");

      date1 = date1[2] + date1[0] + date1[1];
      date2 = date2[2] + date2[0] + date2[1];

      return date1 < date2 ? -1 : 1;
    });
  }

  let privateMsg = await getLastMessagesByUserId(useId);
  privateMsg = sortPrivateMessagesByDate(privateMsg);


  res.status(200).json({
    success: true,
    privateMsg,
  });
};

module.exports = {
  createMessage,
  getAllUserMsg,
};
