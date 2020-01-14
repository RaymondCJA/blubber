const admin = require("firebase-admin"); // to use this admin, we need to initalise our appliation as below

var serviceAccount = require("../key/admin.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
}); // usually for the method we will pass an appliciation into it, but this project already knows that .firebaserc has the project id inside it

const db = admin.firestore();

module.exports = { admin, db };