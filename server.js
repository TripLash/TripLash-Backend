require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const {connect_db} = require('./util/db');
const globalErrorHandler = require('./Controllers/errorController');
const userRouter = require('./Routs/userRout');
const tourRouter = require('./Routs/tourRout');
const guideRouter = require('./Routs/guideRouts');
const reviewRouter = require('./Routs/reviewRouts');
const faviorateRouter = require('./Routs/faviorateRouts');
const notificationRouter = require('./Routs/notificationRouts');
const applicatonRouter = require('./Routs/applicationRout');
const path = require('path');
const chatroomRoutes = require('./Routs/chatroom')
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketIo(server);
const jwt = require('jsonwebtoken');
const Chatroom = require('./Models/chatroomModel');
const Message = require('./Models/messageModel');
const User = require('./Models/userModel');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const {updateGuideApplicationStatuses} = require('./Controllers/applicationController')
const {updateTourApplicationStatuses} = require('./Controllers/applicationController')

app.use(cors())
connect_db()
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


app.use(globalErrorHandler);
app.use('/api/', userRouter);
app.use('/api/', tourRouter);
app.use('/api/', guideRouter);
app.use('/api/', reviewRouter);
app.use('/api/' , faviorateRouter)
app.use('/api/', notificationRouter);
app.use('/api/', chatroomRoutes);
app.use('/api' , applicatonRouter);

app.get('/', (req , res) => {
    res.sendFile(path.join(__dirname , 'public' , 'index.html'))
})

// Schedule the job to run every hour
cron.schedule('0 * * * *', () => {
    console.log('Running the scheduled job to update application statuses...');
    updateGuideApplicationStatuses();
    updateTourApplicationStatuses();
});

io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;
    let user;
    try {
        user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Error verifying token:', error);
        socket.disconnect();
        return;
    }

    socket.user = user;

    socket.on('chat_message', async (body) => {
        try {
        const senderId = socket.user.id;  // Get the sender from the token
        console.log(body);
        console.log(senderId);
        const { chatroomId, content } = body;
        const chatroom = await Chatroom.findById(chatroomId).populate('sender', 'firstname lastname photo').populate('receiver', 'firstname lastname photo');
        if (!chatroom) {
            return socket.emit('error', 'Chatroom not found');
        }

        const receiverId = chatroom.sender.toString() === senderId ? chatroom.receiver : chatroom.sender;
        const senderObj = chatroom.sender.toString() === senderId ? chatroom.sender : chatroom.receiver;
        console.log(`Receiver ID: ${receiverId}`);

        const messageBody = {
            chatroom: chatroomId,
            sender: senderObj,
            receiver: receiverId,
            message: content,
        };

        const savedMessage = await Message.create(messageBody);

        // Update the chatroom with the last message and date
        chatroom.lastMessage = content;
        chatroom.lastMessageDate = new Date();
        await chatroom.save();

        const messageData = {
            id: savedMessage._id,
            content: savedMessage.message,
            sender: `${savedMessage.sender.firstname} ${savedMessage.sender.lastname}`,
            receiver: `${savedMessage.receiver.firstname} ${savedMessage.receiver.lastname}`,
            timestamp: savedMessage.createdAt,
            senderId: savedMessage.sender.id,
            receiverId: savedMessage.receiver.id,
            senderImage: savedMessage.sender.photo,
            receiverImage: savedMessage.receiver.photo
        };
        console.log(messageData)

        socket.emit('receiveMessage', messageData);
        console.log('Message sent successfully');
        } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error.message);
    });
});  

const port = process.env.PORT || 3000;

server.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
})