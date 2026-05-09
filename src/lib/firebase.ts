import firebaseConfig from '../../firebase-applet-config.json';

// Shared instance variables
let _app: any = null;
let _auth: any = null;
let _db: any = null;

// Lazy App initialization
export async function getFirebaseApp() {
  if (!_app) {
    const { initializeApp } = await import('firebase/app');
    _app = initializeApp(firebaseConfig);
  }
  return _app;
}

// Lazy Auth initialization
export async function getAuth() {
  if (!_auth) {
    const app = await getFirebaseApp();
    const { getAuth: getFirebaseAuth } = await import('firebase/auth');
    _auth = getFirebaseAuth(app);
  }
  return _auth;
}

// Lazy Google Provider initialization
export async function getGoogleProvider() {
  const { GoogleAuthProvider } = await import('firebase/auth');
  return new GoogleAuthProvider();
}

// Lazy Firestore initialization
export async function getDb() {
  if (!_db) {
    const app = await getFirebaseApp();
    const { getFirestore } = await import('firebase/firestore');
    _db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
  }
  return _db;
}

// Synchronous getter for already-initialized db
export function getDbSync() {
  return _db;
}

