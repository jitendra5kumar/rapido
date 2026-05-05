import admin from 'firebase-admin';
import {FIREBASE_SERVICE_ACCOUNT,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  FIREBASE_CLIENT_X509_CERT_URL,
} from './env.js';

const firebaseCredentials = (() => {
  if (FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
      console.warn('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', error.message);
      return null;
    }
  }

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase credentials not fully configured. Some features may not work.');
    return null;
  }

  return {
    type: 'service_account',
    project_id: FIREBASE_PROJECT_ID,
    client_email: FIREBASE_CLIENT_EMAIL,
    private_key: FIREBASE_PRIVATE_KEY,
    private_key_id: FIREBASE_PRIVATE_KEY_ID,
    client_id: FIREBASE_CLIENT_ID,
    auth_uri: FIREBASE_AUTH_URI,
    token_uri: FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL,
  };
})();

if (firebaseCredentials) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseCredentials),
  });
  console.log('Firebase initialized');
} else {
  console.warn('Firebase not initialized - credentials unavailable');
}

export default admin;
