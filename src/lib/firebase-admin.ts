import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;
let authAdmin: admin.auth.Auth | undefined;

if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
      console.log("Firebase Admin SDK initialized successfully.");
      db = admin.firestore();
      authAdmin = admin.auth();
    } else {
      console.log('Firebase Admin SDK service account key not found. Admin features will be disabled.');
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
  }
} else {
    // If the app is already initialized, get the existing services
    try {
        db = admin.firestore();
        authAdmin = admin.auth();
    } catch (e){
        console.error("Could not get services from existing Firebase app", e);
    }
}


export { db, authAdmin };
