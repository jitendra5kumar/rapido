const admin = require('firebase-admin');
const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY } = require('./env');

const serviceAccount = {
  type: "service_account",
  project_id: FIREBASE_PROJECT_ID,
  private_key: FIREBASE_PRIVATE_KEY,
  // Add other required fields if needed
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;