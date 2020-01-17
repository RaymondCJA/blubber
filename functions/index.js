const functions = require("firebase-functions");
// our function getBlubs() needs access to the database, using adven sdk
const app = require("express")();

const FBAuth = require("./util/fbAuth");

const { getAllBlubs, postOneBlub } = require("./handlers/blubs");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require("./handlers/users");

// blub routes
app.get("/blubs", getAllBlubs);
app.post("/blub", FBAuth, postOneBlub);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

// users routes
app.post("/signup", signup);
app.post("/login", login);

exports.api = functions.region("asia-east2").https.onRequest(app);
