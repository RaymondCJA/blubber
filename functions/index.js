const functions = require("firebase-functions");
// our function getBlubs() needs access to the database, using adven sdk
const app = require("express")();
const admin = require("firebase-admin"); // to use this admin, we need to initalise our appliation as below
var serviceAccount = require("./key/admin.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
}); // usually for the method we will pass an appliciation into it, but this project already knows that .firebaserc has the project id inside it

const firebaseConfig = {
  apiKey: "AIzaSyAWNkmNcLSu_dMgIzFQglD1mW8paoa4uAo",
  authDomain: "blubberpal-c7253.firebaseapp.com",
  databaseURL: "https://blubberpal-c7253.firebaseio.com",
  projectId: "blubberpal-c7253",
  storageBucket: "blubberpal-c7253.appspot.com",
  messagingSenderId: "652690348988",
  appId: "1:652690348988:web:117a3e1bd8e6697434a9b9",
  measurementId: "G-8P1PNVEE2B"
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

//(ONLY ALLOWS GET REQUEST)
app.get("/blubs", (req, res) => {
  db.collection("blubs")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let blubs = [];
      data.forEach(doc => {
        blubs.push({
          blubId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(blubs);
    })
    .catch(err => console.error(err));
});

// now we create another function that creates documents (ONLY ALLOWS POST REQUEST)
app.post("/blub", (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty" });
  }

  const newBlub = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection("blubs")
    .add(newBlub)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong, pal" });
      console.error(err);
    });
});

const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

// helper function that determines if a field is empty
const iseEmpty = string => {
  if (string.trim() === "") return true;
  //we trim here so that someone who enters 1 space will not let the program consider it "not empty"
  else return false;
};

// Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let errors = {};

  if (iseEmpty(newUser.email)) {
    errors.email = "Email must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (iseEmpty(newUser.password)) errors.password = "Must not be empty";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (iseEmpty(newUser.handle)) errors.handle = "Must not be empty";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  // TODO: validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

//login route here
app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};

  if (iseEmpty(user.email)) errors.email = "Must not be empty";
  if (iseEmpty(user.password)) errors.password = "Must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Your email or password is incorrect, please try again" });
      } else return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.region("asia-east2").https.onRequest(app);
