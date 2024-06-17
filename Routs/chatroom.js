const express = require('express');
const router = express.Router();
const protect = require('../util/middlewares');
const chatroomController = require('../Controllers/chatroomController');


// Create a new chatroom
router.post('/chatrooms/', protect(['client', 'guide']), chatroomController.createChatroom);

// Get all /chatrooms for a user
router.get('/chatrooms/', protect(['client', 'guide']), chatroomController.getAllChatrooms);

// Get all messages for a chatroom
router.get('/chatrooms/:chatroomId/messages', protect(['client', 'guide']), chatroomController.getChatroomMessages);

// Send a message
router.post('/chatrooms/:chatroomId/messages', protect(['client', 'guide']), chatroomController.sendMessage);

// router.get('/chatrooms/', protect, async (req, res) => {
//   const chatrooms = await Chatroom.find();
//   res.json(chatrooms);
// });

module.exports = router;
