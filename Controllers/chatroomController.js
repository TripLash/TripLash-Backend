const Chatroom = require('../Models/chatroomModel');
const Message = require('../Models/messageModel');
const User = require('../Models/userModel');
const catchAsync = require('../util/catchAsync');


exports.createChatroom = catchAsync(async (req , res , next) =>{
    const { guideId } = req.body;
    
    const chatroom = new Chatroom({
        sender: req.user.id,
        receiver: await User.findById(guideId),
    });
    
    await chatroom.save();
    
    res.json(chatroom);
});

exports.getAllChatrooms = catchAsync(async (req , res , next) =>{
    let chatrooms;
    const user_type = req.query.user_type;
    if (user_type === 'client') {
        console.log('client');
        chatrooms = await Chatroom.find({ sender: req.user.id }).populate('receiver', 'firstname lastname photo');
    } else if (user_type === 'guide') {
        console.log('guide');
        chatrooms = await Chatroom.find({ receiver: req.user.id }).populate('sender', 'firstname lastname photo');
    }
    res.json(chatrooms);
});

//TODO: update this endpoint to update isRead field to true
exports.getChatroomMessages = catchAsync(async (req , res , next) =>{
    const messages = await Message.find({ chatroom: req.params.chatroomId }).populate('sender', 'firstname lastname photo').populate('receiver', 'firstname lastname photo');
    // update unread messages
    await Message.updateMany({ chatroom: req.params.chatroomId, receiver: req.user.id, isRead: false }, { isRead: true });
    res.json(messages);
});


// Just for testing 
exports.sendMessage = catchAsync(async (req , res , next) =>{
    const { content } = req.body;

    // Create a new message
    const chatroomObj = await Chatroom.findById(req.params.chatroomId);
    let receiverId;
    if (req.user.id === chatroomObj.sender) {
        receiverId = chatroomObj.receiver;
    } else {
        receiverId = chatroomObj.sender;
    }
    const message = new Message({
        chatroom: req.params.chatroomId,
        sender: req.user.id,
        receiver: receiverId,
        content,
    });

    await message.save();

    // Update the chatroom with the last message and date
    chatroomObj.lastMessage = content;
    chatroomObj.lastMessageDate = new Date();
    await chatroomObj.save();

//     await Chatroom.findByIdAndUpdate(req.params.chatroomId, {
//         lastMessage: content,
//         lastMessageDate: new Date()
//   });

  res.json(message);
})