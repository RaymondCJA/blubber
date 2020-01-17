const functions = require("firebase-functions");
// our function getBlubs() needs access to the database, using adven sdk
const app = require("express")();

const FBAuth = require('./util/fbAuth');

const { getAllBlubs, postOneBlub } = require('./handlers/blubs');
const { signup, login, uploadImage } = require('./handlers/users');

// blub routes 
app.get("/blubs", getAllBlubs);
app.post("/blub", FBAuth, postOneBlub);

// users routes
app.post("/signup", signup);
app.post("/login", login);
app.post('/user/image', FBAuth, uploadImage)

exports.api = functions.region("asia-east2").https.onRequest(app);
