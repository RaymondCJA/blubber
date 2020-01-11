const functions = require('firebase-functions');
// our function getBlubs() needs access to the database, using adven sdk
const app = require('express')();
const admin = require('firebase-admin'); // to use this admin, we need to initalise our appliation as below
admin.initializeApp(); // usually for the method we will pass an appliciation into it, but this project already knows that .firebaserc has the project id inside it

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

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

app.get('/blubs', (req, res) => {
  admin.firestore().collection('blubs').orderBy('createdAt', 'desc').get()
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

// now we create another function that creates documents (THIS DOES NOT WORK)
app.post('/blub', (req, res) => {
    const newBlub = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date.toISOString()
    };

    admin
      .firestore()
      .collection('blubs')
      .add(newBlub)
      .then((doc) => {
        res.json({ message: `document ${doc.id} created successfully` });
      })
      .catch((err) => {
        res.status(500).json({ error: 'something went wrong, pal' });
        console.error(err);
      });
});

// Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  // TODO: validate data

  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res.status(201).json({ message: `user ${data.user.uid} signed up successfully` });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.https.onRequest(app);