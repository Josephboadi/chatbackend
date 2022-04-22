require("dotenv").config();
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey");

// console.log(serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount.serviceAccountKey),
});

module.exports = admin;
