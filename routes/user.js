const {
  userLogin,
  getAllOnlineUsers,
  logOutUser,
  blockUser,
} = require("../controllers/user");

const router = require("express").Router();

// router.post("/blockuser", blockUser);
router.get("/login", userLogin);
router.get("/users/:userId", getAllOnlineUsers);
// router.post("/logout", logOutUser);

module.exports = router;
