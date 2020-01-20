const functions = require("firebase-functions");
// our function getBlubs() needs access to the database, using adven sdk
const app = require("express")();

const FBAuth = require("./util/fbAuth");

const { db } = require("./util/admin");

const {
  getAllBlubs,
  postOneBlub,
  getBlub,
  commentOnBlub,
  likeBlub,
  unlikeBlub,
  deleteBlub
} = require("./handlers/blubs");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
} = require("./handlers/users");

// blub routes
app.get("/blubs", getAllBlubs);
app.post("/blub", FBAuth, postOneBlub);
app.get("/blub/:blubId", getBlub);
app.delete("/blub/:blubId", FBAuth, deleteBlub);
app.get("/blub/:blubId/like", FBAuth, likeBlub);
app.get("/blub/:blubId/unlike", FBAuth, unlikeBlub);
app.post("/blub/:blubId/comment", FBAuth, commentOnBlub);

// users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.region("asia-east2").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("asia-east2")
  .firestore.document("likes/{id}")
  .onCreate(snapshot => {
    db.doc(`/blubs/${snapshot.data().blubId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            blubId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

// if someone likes then unlikes your post, the notification would be removed
exports.deleteNotificationOnUnlike = functions
  .region("asia-east2")
  .firestore.document("likes/{id}")
  .onDelete(snapshot => {
    db.doc(`notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions
  .region("asia-east2")
  .firestore.document("comments/{id}")
  .onCreate(snapshot => {
    db.doc(`/blubs/${snapshot.data().blubId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            blubId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });
