import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export const initializeSocket = (server) => {
 io = new Server(server, { cors: { origin: "*" } });

 io.on("connection", (socket) => {

  console.log("A user connected:", socket.id);


  // Store user ID when they join
  socket.on("join", (userId) => {
   console.log('userId', userId)
   onlineUsers.set(userId.userId, socket.id);
   console.log(`User ${userId.userId} is online`);

   console.log('onlineUsers', onlineUsers.get(userId))
  });

  // Private messaging
  socket.on("sendMessage", async (data) => {
   const { senderId, receiverId, message } = data;
   console.log('data', data)
   // Send message to receiver if online
   console.log('onlineUsers', onlineUsers);

   const receiverSocketId = onlineUsers.get(receiverId);
   console.log('receiverSocketId', receiverSocketId)
   if (receiverSocketId) {
    io.to(receiverSocketId).emit("receiveMessage", data);
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