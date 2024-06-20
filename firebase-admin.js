const admin = require('firebase-admin');

const serviceAccount = require('./triplash-b7e57-firebase-adminsdk-lrkv8-0bf39d1c06.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
