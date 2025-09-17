import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \\n with \n to correctly parse the private key from env variables
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

let db: admin.firestore.Firestore;
let authAdmin: admin.auth.Auth;

try {
  db = admin.firestore();
  authAdmin = admin.auth();
} catch (error) {
    console.error('Error getting firestore or auth', error);
    // In a real app, you might want to throw an error here, 
    // or handle it more gracefully.
    // For now, we'll let it be undefined and the app will fail
    // downstream, which is what was happening anyway.
}


export { db, authAdmin };
