import userModel from "../models/userModel.js";

// Function to save a new message
export const saveMessage = async (sender, receiver, message,wribateId,wribateTitle) => {
 try {
  console.log('sender, receiver, message', sender, receiver, message,wribateId,wribateTitle)
  const newMessage = new userModel.Message({
   sender,
   receiver,
   message,
   wribateId,
   wribateTitle,
   timestamp: new Date()
  });
  await newMessage.save();
  return newMessage;
 } catch (error) {
  console.error("Error saving message:", error);
  throw error;
 }
};

// Function to fetch chat history between two users
export const getMessages = async (userId, otherUserId) => {
 try {
  const messages = await userModel.Message.find({
   $or: [
    { sender: userId, receiver: otherUserId },
    { sender: otherUserId, receiver: userId }
   ]
  }).sort({ timestamp: 1 });
  console.log('messages', messages)
  return messages;
 } catch (error) {
  console.error("Error fetching messages:", error);
  throw error;
 }
};

