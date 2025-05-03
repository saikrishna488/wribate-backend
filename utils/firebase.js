// firebaseAdmin.js
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

// Use a relative path for your service.json
const serviceAccount = JSON.parse(await readFile(new URL('./service.json', import.meta.url), 'utf-8'));


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("Firebase Admin Initialized");

export default admin; // Export the initialized admin

