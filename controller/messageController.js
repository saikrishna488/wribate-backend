import userModel from "../models/userModel.js";
import { getIo } from "../socket.js";

export const sendMessage = async (req, res) => {
 const { senderId, receiverId, message } = req.body;

 try {
  const newMessage = new userModel.Message({ sender: senderId, receiver: receiverId, message });
  await newMessage.save();

  // Emit message to receiver
  const io = getIo();
  io.to(receiverId).emit("receiveMessage", newMessage);

  res.status(201).json(newMessage);
 } catch (error) {
  res.status(500).json({ error: error.message });
 }
};

export default { sendMessage }