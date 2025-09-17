import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let authAdmin: admin.auth.Auth;

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } else {
      console.log('Firebase Admin SDK environment variables are not fully set. Admin features will be disabled.');
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
  }
}

try {
  db = admin.firestore();
  authAdmin = admin.auth();
} catch (error: any) {
    console.error('Error getting Firebase services, Admin SDK might not be initialized:', error.message);
    // @ts-ignore - allow db and authAdmin to be potentially undefined if init fails
    db = undefined; 
    // @ts-ignore
    authAdmin = undefined;
}


export { db, authAdmin };
