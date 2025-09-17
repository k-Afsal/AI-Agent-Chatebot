import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let authAdmin: admin.auth.Auth;

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        throw new Error('Firebase Admin SDK environment variables are not set.');
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
  }
}

try {
  if (admin.apps.length) {
    db = admin.firestore();
    authAdmin = admin.auth();
  } else {
    // Throw an error that can be caught by the calling functions
    // so they don't proceed with an uninitialized db object.
    throw new Error("Firebase Admin SDK not initialized.");
  }
} catch (error) {
    console.error('Error getting Firestore or Auth instance:', error);
    // In a real app, you might want to throw an error here, 
    // or handle it more gracefully.
    // By not assigning db and authAdmin, calls to them will fail,
    // which is the desired behavior if initialization fails.
}


export { db, authAdmin };
