const { createMessage, getAllUserMsg } = require("../controllers/messages");

const router = require("express").Router();

router.post("/createmsg", createMessage);
router.get("/msg/:userId/:myId", getAllUserMsg);

module.exports = router;
