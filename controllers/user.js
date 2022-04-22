const admin = require("../config/firebase.config");
const Users = require("../models/Users");

const newUserData = async (decodeValue, req, res) => {
  const newUser = new Users({
    name: decodeValue.name,
    email: decodeValue.email,
    imageURL: decodeValue.picture,
    userId: decodeValue.user_id,
    email_verified: decodeValue.email_verified,
    auth_time: decodeValue.auth_time,
    status: "online",
  });

  try {
    const savedUser = await newUser.save();
    req.user = savedUser;

    res.status(200).send({ user: savedUser });
  } catch (res) {
    return res.status(500).json({ success: false, message: error });
  }
};

const updateUserData = async (decodeValue, req, res) => {
  const filter = { userId: decodeValue.user_id };
  const options = {
    upsert: true,
    new: true,
  };

  try {
    const result = await Users.findOneAndUpdate(
      filter,
      { auth_time: decodeValue.auth_time, status: "online" },
      options
    );
    req.user = result;

    res.status(200).send({ user: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

exports.userLogin = async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(500).send({ message: "Invalid Token" });
  }

  const token = req.headers.authorization.split(" ")[1];
  try {
    const decodeValue = await admin.auth().verifyIdToken(token);

    if (!decodeValue) {
      return res
        .status(500)
        .json({ success: false, message: "Unauthorized User" });
    }

    // Check if User Exist or Not
    const userExist = await Users.findOne({ userId: decodeValue.user_id });
    if (!userExist) {
      newUserData(decodeValue, req, res);
    } else {
      updateUserData(decodeValue, req, res);
    }
  } catch (error) {
    return res.status(500).send({ success: false, message: error });
  }
};

exports.getAllOnlineUsers = async (req, res) => {
  const user = await Users.findOne({ userId: req.params.userId });

  const users = await Users.find({
    status: "online",
  });

  const newUsers = await users?.filter(
    (item) => item.userId !== req.params.userId
  );

  let finalUser = newUsers.filter((neUser) => {
    return !user?.blockedUsers?.find((itemB) => {
      return neUser.userId === itemB;
    });
  });

  res.status(200).json({
    success: true,
    users: finalUser,
  });
};

exports.blockUser = async (req, res) => {
  console.log(req.body);
  const { userId, blockUserId } = req.body;

  const user = await Users.findOne({ userId: blockUserId });
  user.blockedStatus = true;
  user.blockedUsers.push(userId);
  await user.save();

  res.status(200).json({
    success: true,
  });
};

exports.logOutUser = async (req, res) => {
  const { userId } = req.body;

  const user = await Users.findOne({ userId: userId });

  user.status = "offline";

  await user.save();

  res.status(200).json({
    success: true,
  });
};
