import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let authAdmin: admin.auth.Auth;

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        // This log helps in debugging environment variable issues.
        console.log('Firebase Admin SDK environment variables are not fully set.');
    } else {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
  }
}

// Ensure db and authAdmin are assigned only if initialization was successful.
if (admin.apps.length) {
    db = admin.firestore();
    authAdmin = admin.auth();
} else {
    console.error("Firebase Admin SDK not initialized. Firestore and Auth services will not be available.");
}


export { db, authAdmin };
