import { Server } from "socket.io";
import auth from "../controller/authController.js"
import { saveMessage, getMessages } from "../controller/messageController.js"

let io;
const onlineUsers = new Map();

export const initializeSocket = (server) => {
 io = new Server(server, { cors: { origin: "*" } });

 io.use(auth.authenticateSocket)

 io.on("connection", (socket) => {

  console.log("A user connected:", socket.id, socket.user);
  onlineUsers.set(socket.user.id, socket.id);


  // Private messaging
  socket.on("sendMessage", async (data) => {
   const { sender, receiver, message } = data;
   console.log('data', data)
   console.log('socket.user', socket.user)
   await saveMessage(socket.user.id, receiver, message)
   const receiverSocketId = onlineUsers.get(receiver);
   console.log('receiverSocketId', receiverSocketId)
   if (receiverSocketId) {
    io.to(receiverSocketId).emit("receiveMessage", data);
   }
  });

  // Fetch chat history
  socket.on("getMessages", async ({ receiver }) => {
   try {
    const messages = await getMessages(socket.user.id, receiver);
    socket.emit("chatHistory", messages);
   } catch (error) {
    console.error("Error fetching messages:", error);
   }
  });

  // Disconnect user
  socket.on("disconnect", () => {
   for (let [userId, socketId] of onlineUsers.entries()) {
    if (socketId === socket.id) {
     onlineUsers.delete(userId);
     console.log(`User ${userId} disconnected`);
    }
   }
  });
 });

 return io;
};

export const getIo = () => {
 if (!io) {
  throw new Error("Socket.io not initialized!");
 }
 return io;
};

export default { initializeSocket }