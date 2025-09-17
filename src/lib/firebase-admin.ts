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
        db = admin.firestore();
        authAdmin = admin.auth();
    } else {
        console.log('Firebase Admin SDK environment variables are not fully set. Admin features will be disabled.');
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
  }
} else {
    // If the app is already initialized, just get the services.
    db = admin.firestore();
    authAdmin = admin.auth();
}

// @ts-ignore - db and authAdmin might not be initialized if config is missing.
// Actions that use them should handle this case.
export { db, authAdmin };
