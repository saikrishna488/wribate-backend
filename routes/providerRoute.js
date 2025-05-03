import express from 'express';
const router = express.Router();
import admin from '../utils/firebase.js'; // Firebase Admin instance
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'

router.post('/firebase', async (req, res) => {
  try {
    const { token } = req.body; // Token from frontend (Firebase Auth ID Token)

    if (!token) {
      return res.status(400).json({
        res: false,
        msg: "Token is required",
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid; // You can extract the user's UID and other details

    // Optionally: You can also check user information here, such as email, name, etc.
    console.log("Decoded user data:", decodedToken);

    // Initialize user as null and try to find it in the database
    let user = await userModel.User.findOne({ email: decodedToken.email });

    // If the user doesn't exist, create a new user and save to database
    if (!user) {
      user = await userModel.User.create({
        email: decodedToken.email || null,
        name: decodedToken.name || 'Anonymous',
        profilePhoto: decodedToken.picture || null,
        firebase_token: token,
        // You can leave password, dob, userName, etc. empty for now
      });
    }

    user.firebase_token = token || null
    await user.save();

    // Create JWT token for the user (whether new or existing)
    const userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    const { password: pwd, ...userObj } = user._doc;

    // Set the JWT token as a cookie
    res.cookie('firebase', userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
      path: '/',
    });

    // Return success response
    return res.status(200).json({
      res: true,
      msg: user ? "User authenticated successfully" : "User created and logged in successfully",
      user: userObj, // Send the user data without password
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      res: false,
      msg: "Server error",
    });
  }
});


//decode jwt
router.get('/decode-jwt', async (req, res) => {
  try {
    const token = req.cookies.firebase;

    if (!token) {
      return res.status(400).json({
        res: false,
        msg: 'Token is required',
      });
    }

    // ✅ Decode and verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find the user from the decoded ID
    const user = await userModel.User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        res: false,
        msg: 'User not found',
      });
    }

    // ✅ Respond with user data
    return res.status(200).json({
      res: true,
      user,
    });
  } catch (err) {
    console.error('Error decoding JWT:', err);
    return res.status(500).json({
      res: false,
      msg: 'Server error',
    });
  }
});


//logout
router.get('/logout', (req, res) => {
  try {
    // Clear the token from cookies
    res.clearCookie('firebase', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      path: '/',
    });

    // Send response
    return res.status(200).json({
      res: true,
      msg: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Error logging out:', err);
    return res.status(500).json({
      res: false,
      msg: 'Server error',
    });
  }
});

export default router;
